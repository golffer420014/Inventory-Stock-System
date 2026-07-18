import { Model } from '@/models/base.model.js'

export class Category extends Model {
  static override table = 'categories'

  name!: string
  code!: string
}
