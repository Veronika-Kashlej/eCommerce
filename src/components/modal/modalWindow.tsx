import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Modal, ModalProps } from './Modal';

type ModalOptions = {
  title?: string;
  message?: string;
  buttons?: React.ReactNode;
  onClose?: () => void;
};

let modalRoot: HTMLDivElement | undefined;
let root: Root | undefined;

const modalWindow = {
  show: (options: ModalOptions): void => {
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
      root = createRoot(modalRoot);
    }

    const handleClose = (): void => {
      modalWindow.hide();
      options.onClose?.();
    };

    const modalProps: ModalProps = {
      isOpen: true,
      onClose: handleClose,
      title: options.title,
      message: options.message,
      children: options.buttons,
    };

    root!.render(React.createElement(Modal, modalProps));
  },

  hide: (): void => {
    if (modalRoot && root) {
      root.unmount();
      document.body.removeChild(modalRoot);
      modalRoot = undefined;
      root = undefined;
    }
  },

  alert: (message: string, title = 'Notification'): void => {
    modalWindow.show({
      title,
      message,
      buttons: (
        <div className="modal-buttons">
          <button onClick={() => modalWindow.hide()}>Close</button>
        </div>
      ),
    });
  },

  confirm: (message: string, title = 'Confirmation'): Promise<boolean> => {
    return new Promise((resolve) => {
      modalWindow.show({
        title,
        message,
        buttons: (
          <div className="modal-buttons">
            <button
              onClick={() => {
                modalWindow.hide();
                resolve(false);
              }}
            >
              No
            </button>
            <button
              onClick={() => {
                modalWindow.hide();
                resolve(true);
              }}
            >
              Yes
            </button>
          </div>
        ),
      });
    });
  },
};

export default modalWindow;
