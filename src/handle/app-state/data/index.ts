import { StateHandle } from '../../state';
import { AppState } from '../../../model/app-state';
import { HostRuleConfig, AActiveTabIdx } from '../../../model/rule-config';
import { HandlerHelper } from '../helper';
import * as TCheckboxTabSwitch from '../../../component/base/checkbox-tab-switch/type';
import * as TTextInput from '../../../component/base/input-text/type';

export class DataStateHandler extends StateHandle.BaseStateHandler {
    //// REMOVE RULE (Host/Path; used only in `reflect`)
    onRmvItem({ localState }: AppState, idx: number, parentIdx?: number) {
        const { dataSrc } = localState;      // set by `onDelModal`
        const isSubRow = Number.isInteger(parentIdx);
        const modItems = isSubRow ? dataSrc[parentIdx].paths : dataSrc;
        modItems.splice(idx, 1);

        return {
            rules: dataSrc,
            localState: {}
        };
    }

    onRmvSearchItem(state: AppState, idx: number, parentIdx?: number) {
        const { reflect } = this;
        const { rules: currRules, localState } = state;
        const { searchedRules: currSearchedRules } = localState;
        const isSubRow = Number.isInteger(parentIdx);

        // Remove either row or sub row for searched rules
        const { rules: searchedRules } = reflect.onRmvItem(state, idx, parentIdx);

        // If Not sub row, Remove corresponding row in global rules as well
        const ruleIdx = isSubRow ? null : currRules.indexOf(currSearchedRules[idx]);
        const modRules = isSubRow ? currRules : reflect.onRmvItem({
            ...state,
            localState: {
                ...localState,
                dataSrc: currRules       // replace the ref & point to global rules
            }
        }, ruleIdx, null).rules;

        return {
            rules: modRules,
            localState: {
                searchedRules
            }
        };
    }

    onRmvItems(state: AppState) {
        const { areAllRowsSelected } = state.localState.selectState;
        const { reflect } = this;
        return areAllRowsSelected ? reflect.onRmvAllItems(state) : reflect.onRmvPartialItems(state);
    }

    onRmvAllItems({ localState }: AppState) {
        const { dataSrc, pgnOption, pgnState } = localState;
        const totalRules = dataSrc.length;
        const { startRowIdx, totalVisibleRows } = HandlerHelper.getRowIndexCtx(totalRules, pgnOption, pgnState);
        let modRules: HostRuleConfig[] = dataSrc.concat();

        // - if only 1 page regardless of pagination or not, remove all items
        // - if not, then only remove all items at that page
        if (totalRules <= totalVisibleRows) {
            modRules = [];

        } else {
            modRules.splice(startRowIdx, totalVisibleRows);
        }

        return {
            rules: modRules,
            localState: {}
        };
    }

    onRmvPartialItems({ localState }: AppState ) {
        const { selectState, dataSrc } = localState;
        const rowIndexes: [string, boolean][] = Object.entries(selectState.selectedRowKeys);
        const selectedRowsTotal: number = rowIndexes.length - 1;
        let modRules: HostRuleConfig[] = dataSrc.concat();

        // Remove the item from the end of array so that it doesnt effect the indexes from the beginning
        for (let i = selectedRowsTotal; i >= 0; i--) {
            const rowIdx: number = Number(rowIndexes[i][0]);
            modRules.splice(rowIdx, 1);
        }

        return {
            rules: modRules,
            localState: {}
        };
    }

    onRmvSearchItems(state: AppState) {
        const { reflect } = this;
        const { localState, rules } = state;
        const { searchedRules } = localState;

        // Update the searched rules
        const { rules: modSearchedRules } = reflect.onRmvItems(state);

        // Update corresponding global rules by Excluding all removed searched rows
        const removedSearchedRules = searchedRules.filter(rule => !modSearchedRules.includes(rule));
        const modRules: HostRuleConfig[] = rules.filter(rule => !removedSearchedRules.includes(rule));

        return {
            rules: modRules,
            localState: {
                searchedRules: modSearchedRules
            }
        };
    }

    //// ADD/EDIT RULE
    onItemTitleChange({ rules, localState }: AppState, payload: TTextInput.IOnInputChangeArg) {
        return HandlerHelper.onTextInputChange({
            ...payload,
            inputKey: 'titleInput',
            key: 'title',
            rules,
            localState,
        });
    }

    onItemHostOrPathChange({ rules, localState }: AppState, payload: TTextInput.IOnInputChangeArg) {
        return HandlerHelper.onTextInputChange({
            ...payload,
            inputKey: 'hostOrPathInput',
            key: 'value',
            rules,
            localState,
        });
    }

    //// SCRIPT EXEC STAGE & SWITCH
    onItemJsStageChange({ rules, localState }: AppState, payload): Partial<AppState> {
        const { isActiveItem, parentCtxIdx, ctxIdx, selectValueAttrVal } = payload;

        // If this is the current edit item (Edit View), we get the item based on indexes provided from  `activeRule`. Else we get the item using `parentCtxIdx, ctxIdx` (List View)
        const item = isActiveItem
            ? HandlerHelper.getActiveItem({
                rules,
                ...localState.activeRule,
                isActiveItem: true,
            })
            : Number.isInteger(parentCtxIdx)
                ? rules[parentCtxIdx].paths[ctxIdx]
                : rules[ctxIdx];

        item.jsExecPhase = selectValueAttrVal;
        return { rules };
    }

    // TODO: similar to `onItemTabEnable`
    onItemSwitchToggle({ rules }: AppState, payload): Partial<AppState> {
        const { parentCtxIdx, ctxIdx, key } = payload;
        const item = HandlerHelper.getActiveItem({
            rules,
            ctxIdx,
            parentCtxIdx,
        });
        item[key] = !item[key];
        return { rules };
    }

    onItemActiveTabChange({ rules, localState }: AppState, payload: TCheckboxTabSwitch.IOnTabChange) {
        const item = HandlerHelper.getActiveItem({
            rules,
            ...localState.activeRule,
            isActiveItem: true,
        });
        const { idx } = payload;
        item.activeTabIdx = idx as AActiveTabIdx;
        return { rules };
    }

    onItemTabEnable({ rules, localState }: AppState, payload: TCheckboxTabSwitch.IOnTabChange) {
        const item = HandlerHelper.getActiveItem({
            rules,
            ...localState.activeRule,
            isActiveItem: true,
        });
        const { id, isOn } = payload.tab;
        let key: string;
        switch(id) {
            case 'Css':
                key = 'isCssOn';
                break;
            case 'Js':
                key = 'isJsOn';
                break;
            case 'Lib':
                key = 'isLibOn';
                break;
            default:
                throw new Error('key does not match');
        }
        item[key] = !isOn;
        return { rules };
    }

    onItemEditorCodeChange({ rules, localState }: AppState, payload) {
        const item = HandlerHelper.getActiveItem({
            rules,
            ...localState.activeRule,
            isActiveItem: true,
        });
        const { codeMode, value } = payload;
        const key = `${codeMode}Code`;
        const hsKey = key in item;
        if (!hsKey) throw new Error('key does not match');

        item[key] = value;
        return { rules };
    }
}