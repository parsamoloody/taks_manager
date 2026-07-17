import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { Modal } from "~/components/ui/Modal";
import { Button } from "~/components/ui/Button";

interface DeleteWorkspaceDialogProps {
    open: boolean;
    workspaceName: string
    workspaceId: string
    onClose: () => void;
}

export function DeleteWorkspaceDialog({ open, onClose, workspaceId }: DeleteWorkspaceDialogProps) {
    const fetcher = useFetcher<{ ok: boolean; message?: string }>();
    const formRef = useRef<HTMLFormElement>(null);
    const isSubmitting = fetcher.state !== "idle";

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.ok) {
            formRef.current?.reset();
            onClose();
        }
    }, [fetcher.state, fetcher.data, onClose]);

    return (
        <Modal open={open} onClose={onClose} title="Are you shoure about delete this workspace?">
            <div className="">
                <fetcher.Form method="delete" className="">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="target" value="workspace" />
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button disabled={isSubmitting} type="submit" variant="danger" isLoading={isSubmitting}>
                            yes
                        </Button>
                    </div>

                </fetcher.Form>
                {fetcher.data && !fetcher.data.ok && (
                    <p className="text-sm text-rose-400">{fetcher.data.message}</p>
                )}
            </div>
        </Modal>
    );
}