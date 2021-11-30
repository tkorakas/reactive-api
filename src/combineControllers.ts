import * as Rx from "rxjs";

export function combineControllers(controllers) {
  return function (source) {
    return new Rx.Observable((subscriber) => {
      source.subscribe({
        next(value) {
          Rx.merge(
            ...controllers.map((controller) => controller(Rx.of(value)))
          ).subscribe({
            next(value) {
              subscriber.next(value);
            },
            error(error) {
              subscriber.error(error);
            },
            complete() {
              subscriber.complete();
            },
          });
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
  };
}
