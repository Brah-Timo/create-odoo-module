# Odoo Model Generation Reference

Everything that gets generated inside `odoo_module/models/` and related Python files.

---

## Generated Files

| File | Description |
|------|-------------|
| `odoo_module/__init__.py` | Root package init — imports `models` and `controllers` |
| `odoo_module/models/__init__.py` | Models package init — imports the model module |
| `odoo_module/models/{snake_name}.py` | The main model class |
| `odoo_module/data/{snake_name}_data.xml` | Sequence record |
| `odoo_module/security/ir.model.access.csv` | ACL rules (User + Manager) |
| `odoo_module/security/{snake_name}_security.xml` | Security groups definition |
| `odoo_module/tests/test_{snake_name}.py` | 10 pytest tests (with `--with-tests`) |
| `odoo_module/wizard/{snake_name}_wizard.py` | Transient model (with `--with-wizard`) |

---

## Main Model (`models/{snake_name}.py`)

### Class declaration

```python
class FleetManager(models.Model):
    _name        = 'fleet.manager'
    _description = 'Fleet Manager'
    _inherit     = ['mail.thread', 'mail.activity.mixin']
    _order       = 'name asc'
    _rec_name    = 'name'
```

- **`_inherit`**: `mail.thread` adds chatter (message log); `mail.activity.mixin` adds activity scheduling
- **`_order`**: default sort is alphabetical by name
- **`_rec_name`**: used by Many2one widgets and `display_name` fallback

---

## Fields

### Identity fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `Char` | Primary label. `required=True`, `tracking=True`, `index=True`, `copy=False` |
| `reference` | `Char` | Auto-assigned sequence code (e.g. `FLE/2026/00001`). `readonly=True`, `copy=False`, default `'New'` |
| `description` | `Text` | Optional free-text description |
| `active` | `Boolean` | Archive flag. `default=True`, `tracking=True`. Archived records hidden by default |
| `color` | `Integer` | Integer used by Kanban colour picker |

### Status field

```python
state = fields.Selection([
    ('draft',       'Draft'),
    ('confirmed',   'Confirmed'),
    ('in_progress', 'In Progress'),
    ('done',        'Done'),
    ('cancelled',   'Cancelled'),
], default='draft', tracking=True, string='Status', required=True)
```

All state transitions are tracked in the chatter.

### Relational fields

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `Many2one('res.users')` | Responsible user. Defaults to current user. `tracking=True` |
| `company_id` | `Many2one('res.company')` | Company. Defaults to current company. `required=True`, `index=True` |
| `tag_ids` | `Many2many('res.partner.category')` | Tags widget (re-uses partner categories) |

### Date fields

| Field | Type | Description |
|-------|------|-------------|
| `date_start` | `Date` | Project/task start date |
| `date_end` | `Date` | Project/task end date |
| `create_date` | `Datetime` | Auto-set by Odoo on creation. `readonly=True` |
| `write_date` | `Datetime` | Auto-set by Odoo on write. `readonly=True` |

### Priority field

```python
priority = fields.Selection([
    ('0', 'Normal'),
    ('1', 'Low'),
    ('2', 'High'),
    ('3', 'Very High'),
], default='0', string='Priority')
```

Displayed as a star widget in Form and List views.

### Computed fields

#### `display_name`

```python
display_name = fields.Char(compute='_compute_display_name', store=True)

@api.depends('name', 'reference', 'state')
def _compute_display_name(self):
    for rec in self:
        ref = rec.reference if rec.reference != 'New' else ''
        rec.display_name = f"[{rec.state.upper()}] {rec.name}" + (f" ({ref})" if ref else '')
```

Example output: `[DRAFT] My Record (FLE/2026/00001)`

#### `duration_days`

```python
duration_days = fields.Integer(compute='_compute_duration', store=True, string='Duration (Days)')

@api.depends('date_start', 'date_end')
def _compute_duration(self):
    for rec in self:
        if rec.date_start and rec.date_end:
            rec.duration_days = (rec.date_end - rec.date_start).days
        else:
            rec.duration_days = 0
```

---

## Constraints

### Python constraint (date validation)

```python
@api.constrains('date_start', 'date_end')
def _check_dates(self):
    for rec in self:
        if rec.date_start and rec.date_end and rec.date_start > rec.date_end:
            raise ValidationError(_('Start date must be before end date.'))
```

### SQL constraint (unique reference per company)

```python
_sql_constraints = [
    ('reference_unique', 'UNIQUE(reference, company_id)',
     'Reference must be unique per company.'),
]
```

---

## Sequence

The `create()` override assigns a sequence number on first save:

```python
@api.model_create_multi
def create(self, vals_list):
    for vals in vals_list:
        if vals.get('reference', 'New') == 'New':
            vals['reference'] = self.env['ir.sequence'].next_by_code('fleet.manager') or 'New'
    return super().create(vals_list)
```

The sequence record is defined in `data/{snake_name}_data.xml`:

```xml
<record id="seq_fleet_manager" model="ir.sequence">
    <field name="name">Fleet Manager Sequence</field>
    <field name="code">fleet.manager</field>
    <field name="prefix">FLE/%(year)s/</field>
    <field name="padding">5</field>
    <field name="company_id" eval="False"/>
</record>
```

Generated prefix uses the first 3 uppercase letters of the module name.

---

## State Machine

```
        action_confirm()
draft ───────────────────► confirmed
  ▲                           │
  │                    action_start()
  │                           │
  │                           ▼
  │                      in_progress
  │                           │
  │   action_cancel()  action_done()
  ◄────────────────────────── │
  │                           ▼
  │                         done
  │                           │
  │   action_reset_draft()    │
  ◄───────────────────────────┘
cancelled
```

### Business methods

| Method | Allowed from state | Target state |
|--------|-------------------|-------------|
| `action_confirm()` | `draft` only | `confirmed` |
| `action_start()` | `confirmed` only | `in_progress` |
| `action_done()` | `in_progress` (and others) | `done` |
| `action_cancel()` | any except `done` | `cancelled` |
| `action_reset_draft()` | `cancelled` | `draft` |

`action_open_form()` is also generated — returns an `ir.actions.act_window` to open the record in form view.

---

## Security

### `ir.model.access.csv`

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_fleet_manager_user,fleet.manager User,model_fleet_manager,base.group_user,1,0,0,0
access_fleet_manager_manager,fleet.manager Manager,model_fleet_manager,base.group_system,1,1,1,1
```

- **User group** (`base.group_user`): read-only
- **Manager group** (`base.group_system`): full CRUD

### `{snake_name}_security.xml`

Defines two `res.groups` records:
- `group_{snake}_user` — "{Label} / User"
- `group_{snake}_manager` — "{Label} / Manager" (implies User, admin + root automatically added)

---

## Tests (`tests/test_{snake_name}.py`)

Generated with `--with-tests`. 10 test cases using `common.TransactionCase`:

| Test | What it verifies |
|------|-----------------|
| `test_01_create_basic` | Record created with correct defaults (`state = 'draft'`) |
| `test_02_sequence_assigned` | `reference` is set on create (not `'New'`) |
| `test_03_confirm` | `action_confirm()` transitions to `confirmed` |
| `test_04_cannot_confirm_twice` | Confirming a confirmed record raises exception |
| `test_05_done` | Full lifecycle: draft → confirmed → in_progress → done |
| `test_06_cancel` | `action_cancel()` from draft transitions to `cancelled` |
| `test_07_reset_draft` | `action_reset_draft()` from cancelled transitions to `draft` |
| `test_08_date_constraint` | `date_start > date_end` raises `ValidationError` |
| `test_09_display_name` | `display_name` contains state and record name |
| `test_10_duration` | `duration_days` correctly computed from date range |

**Running tests:**

```bash
# Via Odoo test runner
./odoo-bin test -d mydb --test-tags fleet_manager

# Or via pytest (with odoo in PYTHONPATH)
cd odoo_module
python -m pytest tests/ -v

# Via npm script
npm run odoo:test
```

---

## Wizard (`wizard/{snake_name}_wizard.py`)

Generated with `--with-wizard`. A `TransientModel` for bulk actions:

```python
class FleetManagerWizard(models.TransientModel):
    _name        = 'fleet.manager.wizard'
    _description = 'Fleet Manager Wizard'

    record_ids = fields.Many2many('fleet.manager', string='Records')
    action     = fields.Selection([
        ('confirm', 'Confirm All'),
        ('cancel',  'Cancel All'),
    ], string='Action', required=True, default='confirm')
    note = fields.Text(string='Note / Reason')

    def action_execute(self):
        # Falls back to context active_ids if record_ids empty
        ...
```

The wizard is bound to the list view via `binding_model_id` + `binding_view_types="list"`.

---

## `__manifest__.py` Format

```python
{
    'name': 'Fleet Manager',
    'version': '17.0.1.0.0',
    'category': 'Custom',
    'summary': 'Auto-generated by create-odoo-module CLI',
    'description': """...""",
    'author': 'Acme Corp',
    'website': 'https://acme.com',
    'depends': ['base', 'mail', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'security/fleet_manager_security.xml',
        'views/fleet_manager_views.xml',
        'views/fleet_manager_menus.xml',
        'data/fleet_manager_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'fleet_manager/static/src/js/fleet_manager.js',
            'fleet_manager/static/src/scss/fleet_manager.scss',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
```

Version format: `{odoo_version}.0.{major}.{minor}.{patch}` — e.g. `17.0.1.0.0`.

---

## Customisation After Generation

The generated model is a starting point. Common next steps:

### Add a custom field

```python
# In models/fleet_manager.py
vehicle_count = fields.Integer(string='Vehicle Count', default=0)
license_plate = fields.Char(string='License Plate')
```

### Add a relational field

```python
driver_id = fields.Many2one('res.partner', string='Driver', domain=[('is_company', '=', False)])
history_ids = fields.One2many('fleet.manager.history', 'manager_id', string='History')
```

### Override name search

```python
@api.model
def _name_search(self, name, domain=None, operator='ilike', limit=100, order=None):
    domain = domain or []
    if name:
        domain = ['|', ('name', operator, name), ('reference', operator, name)] + domain
    return self._search(domain, limit=limit, order=order)
```

### Add email notification

```python
def action_confirm(self):
    for rec in self:
        if rec.state != 'draft':
            raise UserError(_('Only draft records can be confirmed.'))
    self.write({'state': 'confirmed'})
    # Send email
    template = self.env.ref('fleet_manager.email_template_confirmed', raise_if_not_found=False)
    if template:
        template.send_mail(self.id, force_send=True)
```
