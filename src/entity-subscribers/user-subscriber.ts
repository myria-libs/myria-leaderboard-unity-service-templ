import {
  type EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';


interface GenericEntity {}

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<GenericEntity> {

}
