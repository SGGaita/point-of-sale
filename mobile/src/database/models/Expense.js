import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Expense extends Model {
  static table = 'expenses';

  @field('category') category;
  @field('amount') amount;
  @field('description') description;
  @field('timestamp') timestamp;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
