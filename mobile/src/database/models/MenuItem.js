import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class MenuItem extends Model {
  static table = 'menu_items';

  @field('name') name;
  @field('price') price;
  @field('category') category;
  @field('is_available') isAvailable;
  @field('server_id') serverId;
  @field('is_synced') isSynced;
  @date('synced_at') syncedAt;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
}
