import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const expenseTemplateService = {
  async getAllTemplates() {
    const templatesCollection = database.collections.get('expense_templates');
    const templates = await templatesCollection
      .query(
        Q.where('is_active', true),
        Q.sortBy('sort_order', Q.asc)
      )
      .fetch();
    
    return templates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      unit: template.unit,
      isActive: template.isActive,
      sortOrder: template.sortOrder,
      isSynced: template.isSynced,
      syncedAt: template.syncedAt,
    }));
  },

  async getTemplatesByCategory(category) {
    const templatesCollection = database.collections.get('expense_templates');
    const templates = await templatesCollection
      .query(
        Q.where('category', category),
        Q.where('is_active', true),
        Q.sortBy('sort_order', Q.asc)
      )
      .fetch();
    
    return templates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      unit: template.unit,
      isActive: template.isActive,
      sortOrder: template.sortOrder,
    }));
  },

  async createTemplate(templateData) {
    const templatesCollection = database.collections.get('expense_templates');
    
    let createdTemplate;
    await database.write(async () => {
      createdTemplate = await templatesCollection.create(template => {
        template.name = templateData.name;
        template.category = templateData.category;
        template.unit = templateData.unit || '';
        template.isActive = true;
        template.sortOrder = templateData.sortOrder || 999;
        template.isSynced = false;
        template.syncedAt = null;
      });
    });
    
    return {
      id: createdTemplate.id,
      name: createdTemplate.name,
      category: createdTemplate.category,
      unit: createdTemplate.unit,
      isActive: createdTemplate.isActive,
      sortOrder: createdTemplate.sortOrder,
    };
  },

  async updateTemplate(templateId, updates) {
    const templatesCollection = database.collections.get('expense_templates');
    const template = await templatesCollection.find(templateId);
    
    await database.write(async () => {
      await template.update(t => {
        if (updates.name !== undefined) t.name = updates.name;
        if (updates.category !== undefined) t.category = updates.category;
        if (updates.unit !== undefined) t.unit = updates.unit;
        if (updates.isActive !== undefined) t.isActive = updates.isActive;
        if (updates.sortOrder !== undefined) t.sortOrder = updates.sortOrder;
        t.isSynced = false;
        t.syncedAt = null;
      });
    });
    
    return template;
  },

  async deleteTemplate(templateId) {
    const templatesCollection = database.collections.get('expense_templates');
    const template = await templatesCollection.find(templateId);
    
    await database.write(async () => {
      await template.update(t => {
        t.isActive = false;
        t.isSynced = false;
        t.syncedAt = null;
      });
    });
  },

  async seedDefaultTemplates() {
    const templatesCollection = database.collections.get('expense_templates');
    const existingTemplates = await templatesCollection.query().fetch();
    
    if (existingTemplates.length > 0) {
      return;
    }

    const defaultTemplates = [
      { name: 'Unga Ugali (2KG)', category: 'Food Supplies', unit: 'Qty', sortOrder: 1 },
      { name: 'Unga Mandazi (2KG)', category: 'Food Supplies', unit: 'Qty', sortOrder: 2 },
      { name: 'Unga Chapati (2KG)', category: 'Food Supplies', unit: 'Qty', sortOrder: 3 },
      { name: 'Rice (1KG)', category: 'Food Supplies', unit: 'Qty', sortOrder: 4 },
      { name: 'Sugar (1KG)', category: 'Food Supplies', unit: 'Qty', sortOrder: 5 },
      { name: 'Milk (1L)', category: 'Food Supplies', unit: 'Qty', sortOrder: 6 },
      { name: 'Tea Leaves', category: 'Food Supplies', unit: 'Ksh', sortOrder: 7 },
      { name: 'Beef (1KG)', category: 'Food Supplies', unit: 'Qty', sortOrder: 8 },
      { name: 'Pilau Masala', category: 'Food Supplies', unit: 'Ksh', sortOrder: 9 },
      { name: 'Soy Sauce', category: 'Food Supplies', unit: 'Ksh', sortOrder: 10 },
      { name: 'Bulb Onions', category: 'Food Supplies', unit: 'Ksh', sortOrder: 11 },
      { name: 'Sukuma', category: 'Food Supplies', unit: 'Ksh', sortOrder: 12 },
      { name: 'Cabbage', category: 'Food Supplies', unit: 'Ksh', sortOrder: 13 },
      { name: 'Spinach', category: 'Food Supplies', unit: 'Ksh', sortOrder: 14 },
      { name: 'Managu', category: 'Food Supplies', unit: 'Ksh', sortOrder: 15 },
      { name: 'Carrot', category: 'Food Supplies', unit: 'Ksh', sortOrder: 16 },
      { name: 'Ginger', category: 'Food Supplies', unit: 'Ksh', sortOrder: 17 },
      { name: 'Garlic', category: 'Food Supplies', unit: 'Ksh', sortOrder: 18 },
      { name: 'Tomatoes', category: 'Food Supplies', unit: 'Ksh', sortOrder: 19 },
      { name: 'Ring Onions', category: 'Food Supplies', unit: 'Ksh', sortOrder: 20 },
      { name: 'Salt', category: 'Food Supplies', unit: 'Ksh', sortOrder: 21 },
      { name: 'Pili Pili', category: 'Food Supplies', unit: 'Ksh', sortOrder: 22 },
      { name: 'Electricity Bill (Tokens)', category: 'Utilities', unit: 'Ksh', sortOrder: 23 },
      { name: 'Charcoal', category: 'Utilities', unit: 'Ksh', sortOrder: 24 },
      { name: 'Cooking Gas', category: 'Utilities', unit: 'Ksh', sortOrder: 25 },
      { name: 'Packaging', category: 'Utilities', unit: 'Ksh', sortOrder: 26 },
      { name: 'Soap', category: 'Utilities', unit: 'Ksh', sortOrder: 27 },
    ];

    await database.write(async () => {
      for (const templateData of defaultTemplates) {
        await templatesCollection.create(template => {
          template.name = templateData.name;
          template.category = templateData.category;
          template.unit = templateData.unit;
          template.isActive = true;
          template.sortOrder = templateData.sortOrder;
          template.isSynced = false;
          template.syncedAt = null;
        });
      }
    });
  },
};
