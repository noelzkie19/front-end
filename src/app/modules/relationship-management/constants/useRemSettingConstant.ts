const useRemSettingConstant = () => {

const remSettingMessages = {
    mandatoryFields: 'Unable to proceed, kindly fill up the mandatory fields',
    removeLanguageSetting: 'Language setting will be removed, please confirm',
    closePage: 'This action will discard any changes made, please confirm',
    existingTemplateName: 'Unable to proceed, Template Name already exists.',
    allReadyOnTable: 'Value already exists, please check the table to find them',
    updateLanguageSetting: 'This action will update language selected, please confirm',
    noChangesPrompt: 'Changes made may not be saved',
    noLanguage:'Please add at least English language on the table to proceed',
    submitConfirm: 'This action will submit the details of the Schedule Template, please confirm',
    updateConfirm: ' This action will update the details of the Schedule Template, please confirm'
}

const defaultOptionValue = [{value: null, label: 'Select...'}];

  return {remSettingMessages, defaultOptionValue};
};

export default useRemSettingConstant;
