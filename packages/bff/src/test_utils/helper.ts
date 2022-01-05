import { PubSub } from 'graphql-subscriptions';

const createSubscriber =
  (pubsub: PubSub) =>
  (topic: string): Promise<IteratorResult<unknown>> => {
    const iterator = pubsub.asyncIterator(topic);

    let done: (result: IteratorResult<unknown>) => void;
    const promise = new Promise<IteratorResult<unknown>>((r) => (done = r));

    iterator.next().then((result) => {
      expect(result).toMatchSnapshot(`subscription-payload-${topic}`);
      done(result);
    });

    return promise;
  };

export { createSubscriber };
