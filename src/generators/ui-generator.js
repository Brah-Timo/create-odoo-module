'use strict';

const path = require('path');
const { writeFile } = require('../utils/file-system');
const logger = require('../utils/logger');

/**
 * Generate Odoo XML views: Form, List, Kanban, Search, Menu.
 */
async function generateUiLayer(targetDir, config) {
  const odooDir = path.join(targetDir, 'odoo_module');
  const s = config.moduleNameSnake;
  const P = config.moduleNamePascal;
  const M = config.moduleNameOdoo;
  const L = config.moduleNameLabel;

  logger.verbose('Generating Odoo XML views...');

  await Promise.all([
    writeFile(path.join(odooDir, 'views', `${s}_views.xml`),  genViews(s, P, M, L, config)),
    writeFile(path.join(odooDir, 'views', `${s}_menus.xml`),  genMenus(s, P, M, L)),
  ]);
}

// ─── Views generator ─────────────────────────────────────────────────────────

function genViews(s, P, M, L, config) {
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- ══════════════════════════════════════════════════════════════════════
         SEARCH VIEW
         ══════════════════════════════════════════════════════════════════ -->
    <record id="view_${s}_search" model="ir.ui.view">
        <field name="name">${M}.search</field>
        <field name="model">${M}</field>
        <field name="arch" type="xml">
            <search string="Search ${L}">
                <field name="name" string="Name" filter_domain="[('name','ilike',self)]"/>
                <field name="reference" string="Reference"/>
                <field name="user_id" string="Responsible"/>
                <separator/>
                <!-- Status filters -->
                <filter name="filter_draft"       string="Draft"
                        domain="[('state','=','draft')]"/>
                <filter name="filter_confirmed"   string="Confirmed"
                        domain="[('state','=','confirmed')]"/>
                <filter name="filter_in_progress" string="In Progress"
                        domain="[('state','=','in_progress')]"/>
                <filter name="filter_done"        string="Done"
                        domain="[('state','=','done')]"/>
                <filter name="filter_cancelled"   string="Cancelled"
                        domain="[('state','=','cancelled')]"/>
                <separator/>
                <filter name="filter_my"    string="My Records"
                        domain="[('user_id','=',uid)]"/>
                <filter name="filter_today" string="Starting Today"
                        domain="[('date_start','=',context_today().strftime('%Y-%m-%d'))]"/>
                <separator/>
                <filter name="filter_archived" string="Archived"
                        domain="[('active','=',False)]"/>
                <!-- Group by -->
                <group expand="0" string="Group By">
                    <filter name="group_state"      string="Status"      context="{'group_by': 'state'}"/>
                    <filter name="group_user"       string="Responsible" context="{'group_by': 'user_id'}"/>
                    <filter name="group_priority"   string="Priority"    context="{'group_by': 'priority'}"/>
                    <filter name="group_date_start" string="Start Date"  context="{'group_by': 'date_start:month'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- ══════════════════════════════════════════════════════════════════════
         FORM VIEW
         ══════════════════════════════════════════════════════════════════ -->
    <record id="view_${s}_form" model="ir.ui.view">
        <field name="name">${M}.form</field>
        <field name="model">${M}</field>
        <field name="arch" type="xml">
            <form string="${L}">
                <header>
                    <button name="action_confirm"    string="Confirm"      type="object"
                            class="btn-primary"
                            invisible="state != 'draft'"/>
                    <button name="action_start"      string="Start"        type="object"
                            class="btn-primary"
                            invisible="state != 'confirmed'"/>
                    <button name="action_done"       string="Mark as Done" type="object"
                            class="btn-success"
                            invisible="state != 'in_progress'"/>
                    <button name="action_cancel"     string="Cancel"       type="object"
                            invisible="state in ('done','cancelled')"/>
                    <button name="action_reset_draft" string="Reset to Draft" type="object"
                            invisible="state != 'cancelled'"/>
                    <field name="state" widget="statusbar"
                           statusbar_visible="draft,confirmed,in_progress,done"/>
                </header>
                <sheet>
                    <!-- Priority stars -->
                    <div class="oe_button_box" name="button_box">
                        <button class="oe_stat_button" type="object"
                                name="action_open_form" icon="fa-info-circle">
                            <div class="o_stat_info">
                                <span class="o_stat_text">Details</span>
                            </div>
                        </button>
                    </div>
                    <widget name="web_ribbon" title="Archived" bg_color="text-bg-danger"
                            invisible="active"/>
                    <field name="active" invisible="1"/>
                    <field name="priority" widget="priority" class="me-3"/>
                    <div class="oe_title">
                        <label for="name" class="oe_edit_only"/>
                        <h1>
                            <field name="name" placeholder="Enter ${L} name…"
                                   class="o_field_text"/>
                        </h1>
                        <h4 class="text-muted">
                            <field name="reference" readonly="1"/>
                        </h4>
                    </div>
                    <group>
                        <group string="General">
                            <field name="user_id"/>
                            <field name="company_id"
                                   groups="base.group_multi_company"/>
                            <field name="tag_ids" widget="many2many_tags"
                                   options="{'color_field': 'color'}"/>
                        </group>
                        <group string="Schedule">
                            <field name="date_start"/>
                            <field name="date_end"/>
                            <field name="duration_days" readonly="1"
                                   invisible="not date_start or not date_end"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Description" name="description">
                            <field name="description" placeholder="Add a description…"/>
                        </page>
                    </notebook>
                </sheet>
                <!-- Chatter -->
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- ══════════════════════════════════════════════════════════════════════
         LIST VIEW
         ══════════════════════════════════════════════════════════════════ -->
    <record id="view_${s}_list" model="ir.ui.view">
        <field name="name">${M}.list</field>
        <field name="model">${M}</field>
        <field name="arch" type="xml">
            <list string="${L}"
                  decoration-muted="state == 'cancelled'"
                  decoration-success="state == 'done'"
                  decoration-warning="state == 'in_progress'">
                <field name="priority" widget="priority"/>
                <field name="reference" readonly="1"/>
                <field name="name"/>
                <field name="user_id" optional="show"/>
                <field name="date_start" optional="show"/>
                <field name="date_end"   optional="show"/>
                <field name="duration_days" string="Days" optional="hide"/>
                <field name="state" widget="badge"
                       decoration-info="state == 'draft'"
                       decoration-primary="state == 'confirmed'"
                       decoration-warning="state == 'in_progress'"
                       decoration-success="state == 'done'"
                       decoration-danger="state == 'cancelled'"/>
                <!-- Inline actions -->
                <button name="action_confirm" string="Confirm" type="object"
                        icon="fa-check" invisible="state != 'draft'"
                        title="Confirm this record"/>
                <button name="action_done" string="Done" type="object"
                        icon="fa-flag-checkered" invisible="state != 'in_progress'"
                        title="Mark as done"/>
            </list>
        </field>
    </record>

    <!-- ══════════════════════════════════════════════════════════════════════
         KANBAN VIEW
         ══════════════════════════════════════════════════════════════════ -->
    <record id="view_${s}_kanban" model="ir.ui.view">
        <field name="name">${M}.kanban</field>
        <field name="model">${M}</field>
        <field name="arch" type="xml">
            <kanban default_group_by="state"
                    class="o_kanban_small_column"
                    quick_create="false">
                <field name="id"/>
                <field name="name"/>
                <field name="state"/>
                <field name="priority"/>
                <field name="user_id"/>
                <field name="date_start"/>
                <field name="date_end"/>
                <field name="color"/>
                <templates>
                    <t t-name="card" class="oe_kanban_card oe_kanban_global_click">
                        <div class="o_kanban_record_top">
                            <div class="o_kanban_record_headings">
                                <strong class="o_kanban_record_title">
                                    <field name="name"/>
                                </strong>
                            </div>
                            <field name="priority" widget="priority"/>
                        </div>
                        <div class="o_kanban_record_body">
                            <div t-if="record.date_start.raw_value" class="text-muted small">
                                <i class="fa fa-calendar me-1"/>
                                <field name="date_start"/>
                                <t t-if="record.date_end.raw_value">
                                    → <field name="date_end"/>
                                </t>
                            </div>
                        </div>
                        <div class="o_kanban_record_bottom">
                            <div class="oe_kanban_bottom_left">
                                <field name="state" widget="badge"/>
                            </div>
                            <div class="oe_kanban_bottom_right">
                                <field name="user_id" widget="many2one_avatar_user"/>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>

    <!-- ══════════════════════════════════════════════════════════════════════
         ACTIVITY VIEW
         ══════════════════════════════════════════════════════════════════ -->
    <record id="view_${s}_activity" model="ir.ui.view">
        <field name="name">${M}.activity</field>
        <field name="model">${M}</field>
        <field name="arch" type="xml">
            <activity string="${L}">
                <field name="user_id"/>
                <templates>
                    <div t-name="activity-box">
                        <img t-att-src="activity_image('res.users','avatar_128',record.user_id.raw_value)"
                             role="img" t-att-title="record.user_id.value"
                             t-att-alt="record.user_id.value"/>
                        <div>
                            <field name="name" display="full"/>
                            <field name="state" muted="1" display="full"/>
                        </div>
                    </div>
                </templates>
            </activity>
        </field>
    </record>

    <!-- ══════════════════════════════════════════════════════════════════════
         ACTION WINDOW
         ══════════════════════════════════════════════════════════════════ -->
    <record id="action_${s}" model="ir.actions.act_window">
        <field name="name">${L}</field>
        <field name="res_model">${M}</field>
        <field name="view_mode">list,kanban,form,activity</field>
        <field name="search_view_id" ref="view_${s}_search"/>
        <field name="context">{
            'search_default_filter_my': 0
        }</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first ${L}!
            </p>
            <p>
                Generated by <a href="https://create-odoo-module.dev" target="_blank">create-odoo-module</a>.
            </p>
        </field>
    </record>

</odoo>
`;
}

function genMenus(s, P, M, L) {
  return `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- ══════════════════════════════════════════════════════════════════════
         TOP-LEVEL MENU
         ══════════════════════════════════════════════════════════════════ -->
    <menuitem
        id="menu_${s}_root"
        name="${L}"
        sequence="50"
        web_icon="${s},static/description/icon.png"/>

    <!-- ══════════════════════════════════════════════════════════════════════
         SUB-MENUS
         ══════════════════════════════════════════════════════════════════ -->
    <menuitem
        id="menu_${s}_main"
        name="${L}"
        parent="menu_${s}_root"
        sequence="10"/>

    <menuitem
        id="menu_${s}_list"
        name="All ${L}s"
        parent="menu_${s}_main"
        action="action_${s}"
        sequence="10"/>

    <!-- Configuration menu (example) -->
    <menuitem
        id="menu_${s}_config"
        name="Configuration"
        parent="menu_${s}_root"
        sequence="90"
        groups="base.group_system"/>

</odoo>
`;
}

module.exports = { generateUiLayer };
