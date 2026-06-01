import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppContext from '../../../helpers/AppContext';
import AuthContext from '../../../helpers/core/AuthContext';

const extractPathFromLabel = label => {
  const to = label?.props?.to;
  return typeof to === 'string' ? to : null;
};

const extractText = label => {
  const children = label?.props?.children;
  if (typeof children === 'string') return children;
  return null;
};

const CpMenu = () => {
  const { menuItems, macroMenuSelection } = useContext(AppContext);
  const { logged } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const rawRoles = [...(logged?.company?.roles || []), ...(logged?.roles || [])];
  const userRoles = rawRoles.map(r => (r === 'admin' ? 'superuser' : r));

  const items = menuItems[macroMenuSelection].filter(
    item => !item.authorizedRoles || item.authorizedRoles.some(r => userRoles.includes(r))
  );

  return (
    <nav className="flex flex-col gap-0.5 font-sans">
      {items.map(item => {
        const path = extractPathFromLabel(item.label);
        const text = extractText(item.label);
        const isActive = path === location.pathname;

        return (
          <button
            type="button"
            key={item.key}
            onClick={() => path && navigate(path)}
            className={`relative flex w-full cursor-pointer items-center gap-3 rounded-md border-0 px-3.5 py-2 text-left font-sans text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
              isActive ? 'bg-primary-bg text-primary' : 'text-ink-2 hover:bg-fill hover:text-ink bg-transparent'
            }`}
          >
            {isActive && <span className="bg-primary absolute bottom-2 left-0 top-2 w-0.5 rounded-sm" />}
            <span className="inline-flex shrink-0 items-center text-sm">{item.icon}</span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{text}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default CpMenu;
