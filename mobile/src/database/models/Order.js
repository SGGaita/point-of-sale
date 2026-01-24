import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export default class Order extends Model {
  static table = 'orders';
  static associations = {
    order_items: { type: 'has_many', foreignKey: 'order_id' },
  };

  @field('order_number') orderNumber;
  @field('waiter') waiter;
  @field('customer_name') customerName;
  @field('total') total;
  @field('status') status;
  @field('timestamp') timestamp;
  @field('is_synced') isSynced;
  @field('synced_at') syncedAt;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @children('order_items') orderItems;
}
