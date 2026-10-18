import { useEffect, useRef, type ReactNode } from "react";

interface DialogComponentProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  dialogRef?: React.RefObject<HTMLDialogElement | null>;
}

export default function DialogComponent({ children, isOpen, onClose, className = "", dialogRef: externalRef }: DialogComponentProps) {
    const internalRef = useRef<HTMLDialogElement>(null);
    const dialogRef = externalRef || internalRef;

    useEffect(() => {
        if (dialogRef.current === null) return;
        if (isOpen) {
            if (!dialogRef.current.open) {
                dialogRef.current.showModal();
            }
        } else {
            if (dialogRef.current.open) {
                dialogRef.current.close();
            }
        }
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            e.stopPropagation();
            onClose();
        }
    };

    const handleClose = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <dialog
            className={`fixed inset-0 bg-[#2a2a2a] text-white rounded-3xl justify-self-center self-center backdrop:bg-black/60 backdrop:backdrop-blur-sm max-w-[85dvw] md:max-w-8xl w-full max-h-[90dvh] overflow-hidden z-50 border border-white/10 shadow-2xl ${isOpen ? 'flex flex-col' : 'hidden'} ${className}`}
            onClick={handleBackdropClick}
            ref={dialogRef}
            onClose={handleClose}
            onCancel={(e) => e.stopPropagation()}
        >
            {children}
        </dialog>
    )
}
