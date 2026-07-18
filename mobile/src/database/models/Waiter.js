import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Waiter extends Model {
  static table = 'waiters';

  @field('name') name;
  @field('server_id') serverId;
  @field('is_active') isActive;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
