import { StateHandle } from '../../state';
import { HandlerHelper } from '../helper';
import { HostRuleConfig, AActiveTabIdx, LibRuleConfig } from '../../../model/rule-config';
import { AppState } from '../../../model/app-state';
import { ActiveRuleState } from '../../../model/active-rule-state';
import { TextInputState } from '../../../model/text-input-state';
import * as TTextInput from '../../../component/base/input-text/type';
import { DataGridState } from '../../../model/data-grid-state';

export class DataSrcStateHandler extends StateHandle.BaseStateHandler {
    //// REMOVE RULE (Host/Path; used only in `reflect`)
    // No Search context involved here
    onRmvActiveItem({ rules, localState }: AppState) {
        const { activeRule } = localState;
        const { isHost, ruleIdx, pathIdx } = activeRule;

        // Remove either Host or Path Rule
        isHost
            ? rules.splice(ruleIdx, 1)
            : rules[ruleIdx].paths.splice(pathIdx, 1);

        // Move the current index & value of input placeholder to previous item (if exist)
        const hasRules = !!rules.length;
        const nextRuleIdx = isHost ? (hasRules ? 0 : null ) : ruleIdx;
        const nextPathIdx = isHost ? pathIdx : (rules[0]?.paths.length ? 0 : null);
        const isNextItemHost = Number.isInteger(nextRuleIdx) && !Number.isInteger(nextPathIdx);
        const nextItem = isNextItemHost ? rules[nextRuleIdx] : rules[nextRuleIdx]?.paths[nextPathIdx];
        const activeItemState = {
            activeRule: new ActiveRuleState({
                isHost: isNextItemHost,
                item: nextItem,
                ruleIdx: nextRuleIdx,
                pathIdx: nextPathIdx
            }),
            activeTitleInput: new TextInputState(
                nextItem
                ? { value: nextItem.title }
                : {}
            ),
            activeValueInput: new TextInputState(
                nextItem
                ? { value: nextItem.value }
                : {}
            ),
        };

        // If there are no more rules, go back to List View
        const viewState = hasRules ? {} : { isListView: true };

        return {
            rules: [...rules],
            localState: {
                ...localState,
                ...activeItemState,
                ...viewState,
                libDataGrid: new DataGridState<LibRuleConfig>()
            }
        };
    }

    // TODO: Helper function not have to return full state
    rmvRule({ localState }: AppState, idx: number, parentIdx?: number) {
        const { dataSrc } = localState.ruleDataGrid;      // set by `onDelModal`
        const isSubRow = Number.isInteger(parentIdx);
        const modItems = isSubRow ? dataSrc[parentIdx].paths : dataSrc;
        modItems.splice(idx, 1);

        return {
            rules: dataSrc,
            localState: {}
        };
    }

    rmvSearchRule(state: AppState, idx: number, parentIdx?: number) {
        const { reflect } = this;
        const { rules: currRules, localState } = state;
        const { searchedRules: currSearchedRules } = localState;
        const isSubRow = Number.isInteger(parentIdx);

        // Remove either row or sub row for searched rules
        const { rules: searchedRules } = reflect.rmvRule(state, idx, parentIdx);

        // If Not sub row, Remove corresponding row in global rules as well
        const ruleIdx = isSubRow ? null : currRules.indexOf(currSearchedRules[idx]);
        const modRules = isSubRow ? currRules : reflect.rmvRule({
            ...state,
            localState: {
                ...localState,
                ruleDataGrid: {
                    ...new DataGridState(),
                    dataSrc: currRules       // replace the ref & point to global rules
                }
            }
        }, ruleIdx, null).rules;

        return {
            rules: modRules,
            localState: {
                searchedRules
            }
        };
    }

    rmvRules(state: AppState) {
        const { areAllRowsSelected } = state.localState.ruleDataGrid.selectState;
        const { reflect } = this;
        return areAllRowsSelected ? reflect.onRmvAllItems(state) : reflect.onRmvPartialItems(state);
    }

    onRmvAllItems({ localState }: AppState) {
        const { dataSrc, pgnOption, pgnState } = localState.ruleDataGrid;
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
        const { dataSrc, selectState } = localState.ruleDataGrid;
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

    rmvSearchRules(state: AppState) {
        const { reflect } = this;
        const { localState, rules } = state;
        const { searchedRules } = localState;

        // Update the searched rules
        const { rules: modSearchedRules } = reflect.rmvRules(state);

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

    rmvLib(libDataGrid: DataGridState<LibRuleConfig>, idx: number): LibRuleConfig[] {
        const { dataSrc } = libDataGrid;
        const modLibs = [...dataSrc];
        modLibs.splice(idx, 1);
        return modLibs;
    }

    rmvLibs(libDataGrid: DataGridState<LibRuleConfig>): LibRuleConfig[] {
        const { dataSrc, selectState } = libDataGrid;
        const { areAllRowsSelected, selectedRowKeys } = selectState;

        // Remove All
        if (areAllRowsSelected) return [];

        // Remove multiple selected
        const modLibs = dataSrc.concat();
        const libIndexes = Object.getOwnPropertyNames(selectedRowKeys);
        const libsTotal = libIndexes.length - 1;

        // Remove the item from the end of array so that it doesnt effect the indexes from the beginning
        for (let i = libsTotal; i >= 0; i--) {
            const rowIdx: number = Number(libIndexes[i][0]);
            modLibs.splice(rowIdx, 1);
        }

        return modLibs;
    }

    //// TEXT INPUT FOR TITLE & URL/PATH
    onActiveRuleTitleInput({ rules, localState }: AppState, payload: TTextInput.IOnInputChangeArg) {
        return HandlerHelper.onTextlInputChange({
            ...payload,
            inputKey: 'activeTitleInput',
            key: 'title',
            rules,
            localState,
        });
    }

    onActiveRuleValueInput({ rules, localState }: AppState, payload: TTextInput.IOnInputChangeArg) {
        return HandlerHelper.onTextlInputChange({
            ...payload,
            inputKey: 'activeValueInput',
            key: 'value',
            rules,
            localState,
        });
    }

    //// SCRIPT EXEC STAGE & SWITCH
    onItemJsExecStepChange(state: AppState, payload): Partial<AppState> {
        const { item, selectValueAttrVal } = payload;
        item.jsExecPhase = selectValueAttrVal;
        return {};
    }

    onItemExecSwitchToggle(state: AppState, payload): Partial<AppState> {
        const { item, id } = payload;
        const key = `is${id}On`;
        const hasKey = key in item;
        if (!hasKey) throw new Error(`key ${key} does not exist`);
        item[key] = !item[key];
        return {};
    }

    onItemActiveExecTabChange(state: AppState, payload): Partial<AppState> {
        const { item, idx } = payload;
        item.activeTabIdx = idx as AActiveTabIdx;
        return {};
    }

    onItemExecCodeChange(state: AppState, payload): Partial<AppState> {
        const { item, codeMode, value } = payload;
        const key = `${codeMode}Code`;
        const hsKey = key in item;
        if (!hsKey) throw new Error(`key ${key} does not exist`);

        item[key] = value;
        return {};
    }

    //// 3RD PARTY LIBRARY SWITCH (async, active)
    onItemLibSwitchToggle(state: AppState, payload): Partial<AppState> {
        const { key, item } = payload;
        item[key] = !item[key];
        return {};
    }
}