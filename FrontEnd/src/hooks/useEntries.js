import { useContext, useCallback } from 'react';
import Api from '../helpers/core/Api';
import AuthContext from '../helpers/core/AuthContext';

const useEntries = () => {
  const { logged } = useContext(AuthContext);
  const companyId = logged?.company?.id;

  const fetchEntries = useCallback(
    (params = {}) => Api.get(`/companies/${companyId}/entries`, { params }).then(res => res.data),
    [companyId]
  );

  const createEntry = useCallback(
    data => Api.post(`/companies/${companyId}/entries`, data).then(res => res.data),
    [companyId]
  );

  const updateEntry = useCallback(
    (id, data) => Api.patch(`/companies/${companyId}/entries/${id}`, data).then(res => res.data),
    [companyId]
  );

  const deleteEntry = useCallback(
    id => Api.delete(`/companies/${companyId}/entries/${id}`).then(res => res.data),
    [companyId]
  );

  return { fetchEntries, createEntry, updateEntry, deleteEntry };
};

export default useEntries;
