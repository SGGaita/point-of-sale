import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';

export default class OrderItem extends Model {
  static table = 'order_items';
  static associations = {
    orders: { type: 'belongs_to', key: 'order_id' },
  };

  @field('order_id') orderId;
  @field('item_name') itemName;
  @field('price') price;
  @field('quantity') quantity;
  @field('total_price') totalPrice;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @relation('orders', 'order_id') order;
}
