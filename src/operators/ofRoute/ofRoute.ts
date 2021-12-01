import { filter } from 'rxjs'

export function ofRoute(url: string) {
    return filter(({req}) => {
        return req.url === url;
    });
}