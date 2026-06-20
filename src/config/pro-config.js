'use strict';

/**
 * Pro template metadata.
 * Each entry describes what extra depends, models, and features
 * a Pro template adds on top of the base scaffold.
 */
const PRO_TEMPLATE_CONFIG = {
  fleet: {
    label:       'Fleet Management',
    description: 'Vehicle tracking, maintenance schedules, fuel logs, driver assignments',
    depends:     ['fleet', 'maintenance'],
    models:      ['vehicle', 'maintenance_request', 'fuel_log'],
    hasReports:  true,
    hasDashboard: true,
  },
  hr: {
    label:       'Human Resources',
    description: 'Employees, contracts, payroll integration, leave management',
    depends:     ['hr', 'hr_payroll', 'hr_holidays'],
    models:      ['employee_extension', 'contract_extension'],
    hasReports:  true,
    hasDashboard: true,
  },
  inventory: {
    label:       'Inventory',
    description: 'Products, lots/serials, barcode scanner, stock moves',
    depends:     ['stock', 'product'],
    models:      ['product_extension', 'stock_move_extension'],
    hasReports:  true,
    hasDashboard: false,
  },
  pos: {
    label:       'Point of Sale',
    description: 'POS session extension, custom payment methods, receipt customization',
    depends:     ['point_of_sale'],
    models:      ['pos_order_extension', 'pos_config_extension'],
    hasReports:  true,
    hasDashboard: false,
  },
  crm: {
    label:       'CRM Pipeline',
    description: 'Leads, pipeline stages, activities, OWL dashboard with charts',
    depends:     ['crm', 'sale_crm'],
    models:      ['crm_lead_extension', 'crm_stage_extension'],
    hasReports:  false,
    hasDashboard: true,
  },
};

function getProTemplateConfig(templateName) {
  return PRO_TEMPLATE_CONFIG[templateName] || null;
}

module.exports = { PRO_TEMPLATE_CONFIG, getProTemplateConfig };
