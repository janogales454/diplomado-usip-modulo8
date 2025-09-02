import { Box } from '@mui/material';
import {
    UserDialog,
    UserFilter,
    UserHeader,
    UserTabla,
    type UserActionState,
} from '../../components';
import { useEffect, useState } from 'react';
import type { UserFilterStatusType, UserType } from '../../components/users/type';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useAlert, useAxios } from '../../hooks';
import { errorHelper, hanleZodError } from '../../helpers';
import { schemaUser, type UserFormValues } from '../../models';

export const UsersPage = () => {
  const { showAlert } = useAlert();
  const axios = useAxios();

  const [filterStatus, setFilterStatus] = useState<UserFilterStatusType>('all');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    retrieveAllUsers();
  }, [search, filterStatus, paginationModel, sortModel]);

  const retrieveAllUsers = async () => {
    try {
      const orderBy = sortModel[0]?.field;
      const orderDir = sortModel[0]?.sort;
      const response = await axios.get('/users', {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy,
          orderDir,
          search,
          status: filterStatus === 'all' ? undefined : filterStatus,
        },
      });
      setUsers(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenDialog(true);
    setUser(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUser(null);
  };

  const retrieveUser = async (id: number) => {
    try {
      const response = await axios.get(`/users/${id}`);
      console.log('response', response);
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const handleOpenEditDialog = (user: UserType) => {
    setOpenDialog(true);
    setUser(user);
  };

  const handleCreateEdit = async (
    _: UserActionState | undefined,
    formdata: FormData
  ) => {
    const rawData = {
      username: formdata.get('username') as string,
      password: formdata.get('password') as string,
      confirmPassword: formdata.get('confirmPassword') as string,
    };
    try {
      schemaUser.parse(rawData);
      if (user?.id) {
        await axios.put(`/users/${user.id}`, rawData);
        showAlert('Usuario editado', 'success');
      } else {
        await axios.post('/users', rawData);
        showAlert('Usuario creado', 'success');
      }
      retrieveAllUsers();
      handleCloseDialog();
      return;
    } catch (error) {
      const err = hanleZodError<UserFormValues>(error, rawData);
      showAlert(err.message, 'error');
      return err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmed = window.confirm('¿Estas seguro de eliminar?');
      if (!confirmed) return;

      await axios.delete(`/users/${id}`);
      showAlert('Usuario eliminado', 'success');
      retrieveAllUsers();
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      const confirmed = window.confirm(
        '¿Estas seguro de que quieres cambiar el estado?'
      );
      if (!confirmed) return;
      let statusValue = status === 'active' ? 'inactive' : 'active';
      await axios.patch(`/users/${id}`, { status: statusValue });
      showAlert('Usuario modificado', 'success');
      retrieveAllUsers();
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <UserHeader handleOpenCreateDialog={handleOpenCreateDialog} />

      <UserFilter
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setSearch={setSearch}
      ></UserFilter>

      <UserTabla
        users={users}
        rowCount={total}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        handleDelete={handleDelete}
        handleStatus={handleStatus}
        handleOpenEditDialog={handleOpenEditDialog}
      />

      <UserDialog
        open={openDialog}
        user={user}
        onClose={handleCloseDialog}
        handleCreateEdit={handleCreateEdit}
      />
    </Box>
  );
};
