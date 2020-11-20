import { StateHandle } from '../../state-handle';
import { AppState } from '../../../model/app-state';
import { LocalState } from '../../../model/local-state';
import { HostRuleConfig } from '../../../model/rule-config';
import * as TPgn from '../../pagination-handle/type';
import * as TSort from '../../sort-handle/type';

export class GeneralStateHandler extends StateHandle.BaseStoreHandler {
    //// Common
    onSearch({ localState, rules }: AppState, evt, val: string, gte3Char: boolean): Partial<AppState> {
        const baseLocalState = {
            ...localState,
            searchedText: val
        };

        // Clear the search (if not clicking the clear button)
        if (!val) return {
            localState: {
                ...baseLocalState,
                searchedRules: null,
            }
        };

        if (!gte3Char) return {
            localState: baseLocalState
        };

        const { hsText } = this.reflect;
        const searchedRules: HostRuleConfig[] = val
            .split(/\s+/)
            .reduce((filteredRules: HostRuleConfig[], text: string) => {
                text = text.toLowerCase();

                return filteredRules.filter(({ id, value, paths }: HostRuleConfig) => {
                    // Check Row Id, Value
                    if (hsText([id, value], text)) return true;

                    // Check Sub Row Id, Value
                    return paths.some(({ id: subId, value: subValue }) => hsText([subId, subValue], text));
                });
            }, rules);

        return {
            localState: {
                ...baseLocalState,
                searchedRules,
            }
        };
    }

    onSearchClear({ localState }: AppState) {
        return {
            localState: {
                ...localState,
                searchedRules: null,
                searchedText: ''
            }
        };
    }

    //// Edit View
    onListView({localState}: AppState): Partial<AppState> {
        const { pgnOption } = localState;   // maintain the only pagination setting
        const resetLocalState = new LocalState();

        return {
            localState: {
                ...resetLocalState,
                pgnOption,
                editViewTarget: null
            }
        };
    }

    onListItemClick({ localState }: AppState, ...[, { item }]) {
        return {
            localState: {
                ...localState,
                editViewTarget: item,
            }
        };
    }

    //// List View
    onPaginate({ localState}: AppState, payload: { pgnOption: TPgn.IOption, pgnState: TPgn.IState }) {
        return {
            localState: {
                ...localState,

                // clear all selections
                selectState: {
                    areAllRowsSelected: false,
                    selectedRowKeys: {},
                },

                // Update pagination
                ...payload
            }
        };
    }

    onSort({ localState }: AppState, { sortOption }: { sortOption: TSort.IOption, sortState: TSort.IState }) {
        return {
            localState: {
                ...localState,
                sortOption
            }
        };
    }

    onActiveTabChange({ localState }: AppState, ...[,,idx]: any[]) {
        const modLocalState = { ...localState };
        modLocalState.editViewTarget.activeTabIdx = idx;

        return {
            localState: modLocalState
        };
    }

    onTabEnable({ localState }: AppState, evt, { id, isOn }) {
        const modLocalState = { ...localState };
        let key: string;

        switch(id) {
            case 'css':
                key = 'isCssOn';
                break;
            case 'js':
                key = 'isJsOn';
                break;
            case 'lib':
                key = 'isLibOn';
                break;
            default:
                throw new Error('key does not match');
        }

        modLocalState.editViewTarget[key] = !isOn;

        return {
            localState: modLocalState
        };
    }

    onEditorCodeChange({ localState }: AppState, { codeMode, value }) {
        const modLocalState = { ...localState };
        const key: string = `${codeMode}Code`;
        const hsKey = key in modLocalState.editViewTarget;

        if (!hsKey) throw new Error('key does not match');

        modLocalState.editViewTarget[key] = value;
        return {
            localState: modLocalState
        };
    }


    //// HELPER
    hsText(vals: string[], text: string): boolean {
        return vals.some((val: string) => (val.toLowerCase().indexOf(text) !== -1));
    }
}