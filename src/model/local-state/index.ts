import { HostRuleConfig, LibRuleConfig } from '../rule-config';
import { TextInputState } from '../text-input-state';
import { DataGridState } from '../data-grid-state';
import { DelRuleState } from '../del-rule-state';
import { ActiveRuleState } from '../active-rule-state';

export class LocalState {
    //// VIEW
    isListView = true;

    //// SEARCH
    searchedText = '';
    searchedRules: HostRuleConfig[] = null;

    //// CURRENT RULE
    activeRule = new ActiveRuleState();
    activeTitleInput = new TextInputState();    // text input for title in edit mode
    activeValueInput = new TextInputState();    // text input for host/path in edit mode

    //// RULE TO DELETE
    delRule = new DelRuleState();

    //// MODAL
    activeModalId: string = null;
    isModalConfirmBtnEnabled = false;
    modalExportFileInput = new TextInputState();
    modalImportFileInput: File = null;
    modalTitleInput = new TextInputState();
    modalValueInput = new TextInputState();
    modalRuleIdx: number = null; // for targeting the host where new path will be added to
    modalLibIdx: number = null;  // for targeting which host/path's library is edited

    //// DATA GRID TABLES
    ruleDataGrid = new DataGridState();
    libDataGrid = new DataGridState<LibRuleConfig>();
}