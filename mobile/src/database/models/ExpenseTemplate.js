import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class ExpenseTemplate extends Model {
  static table = 'expense_templates';

  @field('name') name;
  @field('category') category;
  @field('unit') unit;
  @field('is_active') isActive;
  @field('sort_order') sortOrder;
  @field('is_synced') isSynced;
  @field('synced_at') syncedAt;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
