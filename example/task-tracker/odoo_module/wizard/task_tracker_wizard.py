# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import UserError


class TaskTrackerWizard(models.TransientModel):
    """Wizard for bulk actions on Task Tracker."""
    _name        = 'task.tracker.wizard'
    _description = 'Task Tracker Wizard'

    record_ids = fields.Many2many('task.tracker', string='Records')
    action     = fields.Selection([
        ('confirm', 'Confirm All'),
        ('cancel',  'Cancel All'),
    ], string='Action', required=True, default='confirm')
    note = fields.Text(string='Note / Reason')

    def action_execute(self):
        self.ensure_one()
        records = self.record_ids or self.env['task.tracker'].browse(
            self.env.context.get('active_ids', [])
        )
        if not records:
            raise UserError(_('No records selected.'))

        if self.action == 'confirm':
            records.action_confirm()
        elif self.action == 'cancel':
            records.action_cancel()

        return {'type': 'ir.actions.act_window_close'}
