# -*- coding: utf-8 -*-
from odoo.tests import common, tagged


@tagged('post_install', '-at_install', 'task_tracker')
class TestTaskTracker(common.TransactionCase):
    """
    Unit tests for Task Tracker (task.tracker).
    Run with: python -m pytest addons/task_tracker/tests/ -v
    Or via Odoo: ./odoo-bin test -d mydb --test-tags task_tracker
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Model = cls.env['task.tracker']
        cls.user  = cls.env.ref('base.user_admin')

    def _create_record(self, name='Test Record', **kwargs):
        return self.Model.create({'name': name, **kwargs})

    # ── Creation ─────────────────────────────────────────────────────────────
    def test_01_create_basic(self):
        rec = self._create_record()
        self.assertTrue(rec.id, 'Record should have an ID after creation')
        self.assertEqual(rec.name, 'Test Record')
        self.assertEqual(rec.state, 'draft', 'Default state should be draft')

    def test_02_sequence_assigned(self):
        rec = self._create_record('Seq Test')
        self.assertNotEqual(rec.reference, 'New', 'Sequence should be assigned on create')

    # ── State machine ─────────────────────────────────────────────────────────
    def test_03_confirm(self):
        rec = self._create_record('Confirm Test')
        rec.action_confirm()
        self.assertEqual(rec.state, 'confirmed')

    def test_04_cannot_confirm_twice(self):
        rec = self._create_record('Double Confirm')
        rec.action_confirm()
        with self.assertRaises(Exception):
            rec.action_confirm()

    def test_05_done(self):
        rec = self._create_record('Done Test')
        rec.action_confirm()
        rec.action_start()
        rec.action_done()
        self.assertEqual(rec.state, 'done')

    def test_06_cancel(self):
        rec = self._create_record('Cancel Test')
        rec.action_cancel()
        self.assertEqual(rec.state, 'cancelled')

    def test_07_reset_draft(self):
        rec = self._create_record('Reset Test')
        rec.action_cancel()
        rec.action_reset_draft()
        self.assertEqual(rec.state, 'draft')

    # ── Date constraint ───────────────────────────────────────────────────────
    def test_08_date_constraint(self):
        from odoo.exceptions import ValidationError
        import datetime
        with self.assertRaises(ValidationError):
            self._create_record(
                'Bad Dates',
                date_start=datetime.date(2025, 12, 31),
                date_end=datetime.date(2025, 1, 1),
            )

    # ── Computed fields ───────────────────────────────────────────────────────
    def test_09_display_name(self):
        rec = self._create_record('Display Test')
        self.assertIn('draft', rec.display_name.lower())
        self.assertIn('display test', rec.display_name.lower())

    def test_10_duration(self):
        import datetime
        rec = self._create_record(
            'Duration Test',
            date_start=datetime.date(2025, 1, 1),
            date_end=datetime.date(2025, 1, 11),
        )
        self.assertEqual(rec.duration_days, 10)
