import { useCallback, useContext } from 'react';
import Api from '../helpers/core/Api';
import AuthContext from '../helpers/core/AuthContext';

const useCollaborators = () => {
  const { logged } = useContext(AuthContext);
  const companyId = logged?.company?.id;

  const fetchCollaborators = useCallback(
    (params = {}) => Api.get(`/companies/${companyId}/users`, { params }).then(res => res.data),
    [companyId]
  );

  const inviteCollaborator = useCallback(
    data => Api.post(`/companies/${companyId}/invite`, data).then(res => res.data),
    [companyId]
  );

  const removeCollaborator = useCallback(
    id => Api.delete(`/companies/${companyId}/users/${id}`).then(res => res.data),
    [companyId]
  );

  return { fetchCollaborators, inviteCollaborator, removeCollaborator };
};

export default useCollaborators;
