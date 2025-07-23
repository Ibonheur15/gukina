import React from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import useConfirmation from '../hooks/useConfirmation';

const ConfirmationExample = () => {
  const { confirm, modalProps } = useConfirmation();

  const handleDeleteItem = () => {
    confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        console.log('Item deleted!');
        // Perform delete operation here
      }
    });
  };

  const handleWarningConfirmation = () => {
    confirm({
      title: 'Warning',
      message: 'This action may have consequences. Are you sure you want to proceed?',
      confirmText: 'Proceed',
      cancelText: 'Go Back',
      type: 'warning',
      onConfirm: () => {
        console.log('Warning acknowledged!');
        // Perform action here
      }
    });
  };

  const handleInfoConfirmation = () => {
    confirm({
      title: 'Information',
      message: 'This will refresh your data. Continue?',
      confirmText: 'Continue',
      cancelText: 'Cancel',
      type: 'info',
      onConfirm: () => {
        console.log('Information acknowledged!');
        // Perform action here
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Confirmation Modal Examples</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl mb-2">Danger Confirmation</h2>
          <button
            onClick={handleDeleteItem}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Item
          </button>
        </div>
        
        <div>
          <h2 className="text-xl mb-2">Warning Confirmation</h2>
          <button
            onClick={handleWarningConfirmation}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Perform Action
          </button>
        </div>
        
        <div>
          <h2 className="text-xl mb-2">Info Confirmation</h2>
          <button
            onClick={handleInfoConfirmation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Render the confirmation modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
};

export default ConfirmationExample;