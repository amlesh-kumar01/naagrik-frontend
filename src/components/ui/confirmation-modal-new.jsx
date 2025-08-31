import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from './dialog';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Textarea } from './textarea';
import { 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  Info, 
  HelpCircle 
} from 'lucide-react';

// Modal variant configurations
const MODAL_VARIANTS = {
  danger: {
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
  },
  warning: {
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
  },
  info: {
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  },
  success: {
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  }
};

const VARIANT_ICONS = {
  danger: Trash2,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
  
  // Warning and Info items
  warningItems = [],
  infoItems = [],
  
  // Select input
  showSelectInput = false,
  selectLabel = '',
  selectOptions = [],
  selectValue = '',
  onSelectChange,
  selectRequired = false,
  
  // Text input/textarea
  showTextInput = false,
  textInputLabel = '',
  textInputValue = '',
  onTextInputChange,
  textInputPlaceholder = '',
  textInputRequired = false,
  textInputMinLength = 0,
  confirmationPhrase = '',
  
  // Custom validation
  customValidation,
  
  // Children for custom content
  children
}) => {
  const variantConfig = MODAL_VARIANTS[variant] || MODAL_VARIANTS.info;
  const IconComponent = VARIANT_ICONS[variant] || Info;

  // Form validation
  const isFormValid = () => {
    // Custom validation if provided
    if (customValidation) {
      return customValidation();
    }

    // Select input validation
    if (showSelectInput && selectRequired && !selectValue) {
      return false;
    }

    // Text input validation
    if (showTextInput && textInputRequired) {
      if (!textInputValue || textInputValue.trim().length === 0) {
        return false;
      }
      
      // Confirmation phrase validation
      if (confirmationPhrase && textInputValue.trim() !== confirmationPhrase) {
        return false;
      }
      
      // Minimum length validation
      if (textInputMinLength > 0 && textInputValue.trim().length < textInputMinLength) {
        return false;
      }
    }

    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto sm:max-w-lg">
        <DialogHeader className="text-center pb-6">
          <div className={`mx-auto mb-4 h-16 w-16 rounded-full ${variantConfig.iconBg} flex items-center justify-center animate-pulse`}>
            <IconComponent className={`h-8 w-8 ${variantConfig.iconColor}`} />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </DialogTitle>
          {/* Main Description */}
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning/Info Items */}
          {(warningItems?.length > 0 || infoItems?.length > 0) && (
            <div className="space-y-3">
              {warningItems?.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1">
                      {warningItems.map((item, index) => (
                        <li key={index} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {infoItems?.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Additional Information</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1">
                      {infoItems.map((item, index) => (
                        <li key={index} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Select Input */}
          {showSelectInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectLabel} {selectRequired && <span className="text-red-500">*</span>}
              </label>
              <select 
                value={selectValue} 
                onChange={(e) => onSelectChange?.(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select {selectLabel}</option>
                {selectOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Text Input / Textarea */}
          {showTextInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {textInputLabel} {textInputRequired && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                value={textInputValue}
                onChange={(e) => onTextInputChange?.(e.target.value)}
                placeholder={textInputPlaceholder}
                rows={confirmationPhrase ? 1 : 4}
                className="w-full resize-none transition-all"
              />
              {textInputMinLength > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {confirmationPhrase 
                    ? `Type "${confirmationPhrase}" to confirm`
                    : `Minimum ${textInputMinLength} characters required`
                  }
                </p>
              )}
            </div>
          )}

          {/* Custom Children Content */}
          {children}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={isLoading || !isFormValid()}
              className={`flex-1 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${variantConfig.buttonColor}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
