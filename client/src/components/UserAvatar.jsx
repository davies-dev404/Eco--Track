export const UserAvatar = ({ name, className }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'DR';
    return (
        <div className={`flex items-center justify-center bg-slate-700 text-white text-xs font-bold rounded-full w-8 h-8 ${className}`}>
            {initials}
        </div>
    );
};
