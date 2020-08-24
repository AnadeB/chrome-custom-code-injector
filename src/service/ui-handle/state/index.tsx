import React, { Component, ComponentClass } from 'react';
import { TStore, TCmp, TProxyGetHandler, IClass } from './type';

export class StoreHandler {
    get reflect() {
        return this;
    }
}

export class StateHandle {
    static init(Cmp: TCmp, Store: IClass<TStore>, Handler: IClass<StoreHandler>): ComponentClass {
        const { getProxyGetHandler } = this;

        return class extends Component<any, TStore> {
            storeHandler: StoreHandler;

            constructor(props: Record<string, any>) {
                super(props);
                this.state = new Store();
                this.storeHandler = new Proxy(new Handler(), {
                    get: getProxyGetHandler(
                        () => this.state,
                        (state: TStore) => this.setState(state)
                    )
                });
            }

            render() {
                return <Cmp store={this.state} storeHandler={this.storeHandler} />;
            }
        }
    }

    static getProxyGetHandler(stateGetter: () => TStore, stateSetter: (store: TStore) => void): TProxyGetHandler {
        return (target: StoreHandler, key: string, proxy: StoreHandler) => {
            const method = target[key];

            // For `reflect` property and properties that dont exist
            if (typeof method !== 'function') return method;

            // If proxied method is called, then return a wrapped method which includes setting the state
            return (...args: any[]) => {
                const currState: TStore = stateGetter();
                const modState: TStore = method.call(proxy, currState, ...args);
                stateSetter(modState);
            }
        }
    }
}