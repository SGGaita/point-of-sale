import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Expense extends Model {
  static table = 'expenses';

  @field('template_id') templateId;
  @field('category') category;
  @field('amount') amount;
  @field('quantity') quantity;
  @field('unit_cost') unitCost;
  @field('description') description;
  @field('timestamp') timestamp;
  @field('is_synced') isSynced;
  @field('synced_at') syncedAt;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
