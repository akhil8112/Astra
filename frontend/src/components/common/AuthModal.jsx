import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { Zap } from "lucide-react";

// The component now accepts a custom title and description, with default values.
export const AuthModal = ({
    open,
    onOpenChange,
    title = "Access Your Dashboard",
    description = "Please log in or create an account to continue."
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <div className="flex justify-center mb-2">
                        <Zap className="h-10 w-10 text-primary" />
                    </div>
                    {/* We now use the props for the title and description */}
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 pt-4">
                    <Button asChild size="lg">
                        <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary">
                        <Link to="/signup">Create Account</Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};