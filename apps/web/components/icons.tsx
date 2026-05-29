"use client";

/**
 * App icon set — refined stroke icons from Hugeicons.
 * Wrapped so call sites keep the same API: <ArrowLeft className="size-4" />.
 * Swap an icon in one place here and it updates everywhere.
 */
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    ArrowLeft02Icon,
    ArrowRight01Icon,
    ArrowRight02Icon,
    ArrowUp01Icon,
    ArrowDown01Icon,
    ArrowDown02Icon,
    PlusSignIcon,
    Delete02Icon,
    PencilEdit02Icon,
    Edit02Icon,
    Copy01Icon,
    Download04Icon,
    RefreshIcon,
    Archive02Icon,
    ArchiveArrowUpIcon,
    FavouriteIcon,
    CheckmarkCircle02Icon,
    Loading03Icon,
    SparklesIcon,
    MagicWand01Icon,
    ViewIcon,
    ViewOffIcon,
    LockIcon,
    GlobeIcon,
    QrCodeIcon,
    MoreVerticalIcon,
    LinkSquare02Icon,
    Clock01Icon,
    HashtagIcon,
    Task01Icon,
    ClipboardIcon,
    DashboardSquare01Icon,
    Logout01Icon,
    Sun03Icon,
    Moon02Icon,
    Settings02Icon,
    Search01Icon,
    FilterIcon,
    File02Icon,
    Csv01Icon,
    File01Icon,
    BarChartIcon,
    AnalyticsUpIcon,
    Analytics01Icon,
    PaintBoardIcon,
    ZapIcon,
    Shield01Icon,
    User02Icon,
    Mail01Icon,
    Building02Icon,
    DragDropVerticalIcon,
    ArrowDataTransferHorizontalIcon,
    Layout01Icon,
    InboxIcon,
    Tick02Icon,
    Cancel01Icon,
    SourceCodeIcon,
    Message01Icon,
    Share08Icon,
    DatabaseIcon,
    GitBranchIcon,
    QuoteUpIcon,
    DashboardSpeed01Icon,
    WorkflowSquare02Icon,
    Key01Icon,
    CrownIcon,
    UserMultipleIcon,
    AlertCircleIcon,
    Link01Icon,
    AiBrain01Icon,
} from "@hugeicons/core-free-icons";

type IconObject = Parameters<typeof HugeiconsIcon>[0]["icon"];
type IconProps = Omit<Parameters<typeof HugeiconsIcon>[0], "icon">;

function make(icon: IconObject) {
    function Icon(props: IconProps) {
        return <HugeiconsIcon icon={icon} {...props} />;
    }
    return Icon;
}

export const ArrowLeft = make(ArrowLeft02Icon);
export const ArrowRight = make(ArrowRight02Icon);
export const ChevronUp = make(ArrowUp01Icon);
export const ChevronDown = make(ArrowDown01Icon);
export const ChevronLeft = make(ArrowLeft01Icon);
export const ChevronRight = make(ArrowRight01Icon);
export const ArrowDown = make(ArrowDown02Icon);
export const Plus = make(PlusSignIcon);
export const Trash2 = make(Delete02Icon);
export const Pencil = make(PencilEdit02Icon);
export const PencilLine = make(Edit02Icon);
export const Copy = make(Copy01Icon);
export const Download = make(Download04Icon);
export const Refresh = make(RefreshIcon);
export const Archive = make(Archive02Icon);
export const ArchiveRestore = make(ArchiveArrowUpIcon);
export const Star = make(FavouriteIcon);
export const CheckCircle = make(CheckmarkCircle02Icon);
export const Loader2 = make(Loading03Icon);
export const Sparkles = make(SparklesIcon);
export const MagicWand = make(MagicWand01Icon);
export const Eye = make(ViewIcon);
export const EyeOff = make(ViewOffIcon);
export const Lock = make(LockIcon);
export const Globe = make(GlobeIcon);
export const QrCode = make(QrCodeIcon);
export const MoreVertical = make(MoreVerticalIcon);
export const ExternalLink = make(LinkSquare02Icon);
export const Clock = make(Clock01Icon);
export const Hash = make(HashtagIcon);
export const ClipboardList = make(Task01Icon);
export const Clipboard = make(ClipboardIcon);
export const LayoutDashboard = make(DashboardSquare01Icon);
export const LogOut = make(Logout01Icon);
export const Sun = make(Sun03Icon);
export const Moon = make(Moon02Icon);
export const Settings = make(Settings02Icon);
export const Search = make(Search01Icon);
export const Filter = make(FilterIcon);
export const FileText = make(File02Icon);
export const FileSpreadsheet = make(Csv01Icon);
export const File = make(File01Icon);
export const BarChart3 = make(BarChartIcon);
export const BarChartUp = make(AnalyticsUpIcon);
export const Analytics = make(Analytics01Icon);
export const Palette = make(PaintBoardIcon);
export const Zap = make(ZapIcon);
export const Shield = make(Shield01Icon);
export const User = make(User02Icon);
export const Mail = make(Mail01Icon);
export const Building2 = make(Building02Icon);
export const GripVertical = make(DragDropVerticalIcon);
export const ArrowRightLeft = make(ArrowDataTransferHorizontalIcon);
export const LayoutTemplate = make(Layout01Icon);
export const Inbox = make(InboxIcon);
export const Check = make(Tick02Icon);
export const X = make(Cancel01Icon);
export const Code2 = make(SourceCodeIcon);
export const MessageSquare = make(Message01Icon);
export const Share2 = make(Share08Icon);
export const Database = make(DatabaseIcon);
export const GitBranch = make(GitBranchIcon);
export const Quote = make(QuoteUpIcon);
export const Gauge = make(DashboardSpeed01Icon);
export const Workflow = make(WorkflowSquare02Icon);
export const KeyRound = make(Key01Icon);
export const Crown = make(CrownIcon);
export const Users = make(UserMultipleIcon);
export const AlertCircle = make(AlertCircleIcon);
export const Link = make(Link01Icon);
export const Edit3 = make(Edit02Icon);
export const EyeIcon = make(ViewIcon);
export const AiBrain = make(AiBrain01Icon);
