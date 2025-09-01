import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { UserType } from './type';
import { useActionState, useState } from 'react';
import type { ActionState } from '../../interfaces';
import type { UserFormValues } from '../../models';
import { createInitialState } from '../../helpers';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export type UserActionState = ActionState<UserFormValues>;

interface Props {
  open: boolean;
  user?: UserType | null;
  onClose: () => void;
  handleCreateEdit: (
    _: UserActionState | undefined,
    formData: FormData
  ) => Promise<UserActionState | undefined>;
}
export const UserDialog = ({ onClose, open, user, handleCreateEdit }: Props) => {
  const initialState = createInitialState<UserFormValues>();

  const [state, submitAction, isPending] = useActionState(
    handleCreateEdit,
    initialState
  );
  console.log('user', user);
  const [isVisible, setIsVisible] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} maxWidth={'sm'} fullWidth>
      <DialogTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
      <Box key={user?.id ?? 'new'} component={'form'} action={submitAction}>
        <DialogContent>
            <TextField
            name="username"
            autoFocus
            margin="dense"
            label="Nombre de Usuario"
            fullWidth
            required
            variant="outlined"
            disabled={isPending}
            defaultValue={state?.formData?.username || user?.username || ''}
            error={!!state?.errors?.username}
            helperText={state?.errors?.username}
            sx={{ mb: 2 }}
            />
          
            <div style={{ position: 'relative' }}>
            <TextField
              name="password"
              margin="dense"
              label="Password"
              fullWidth
              required
              variant="outlined"
              disabled={isPending}
              type={ isVisible ? 'text' : 'password' }
              defaultValue={state?.formData?.password || user?.password || ''}
              error={!!state?.errors?.password}
              helperText={state?.errors?.password}
              sx={{ mb: 2 }}
            />
            <div className='password-toggle-icon' onClick={ () => setIsVisible(!isVisible) }>{ isVisible ? <Visibility/> : <VisibilityOff/> }</div>
            </div>
            <div style={{ position: 'relative' }}>
            <TextField
              name="confirmPassword"
              margin="dense"
              label="Repetir password"
              fullWidth
              required
              variant="outlined"
              disabled={isPending}
              type={ isVisible ? 'text' : 'password' }
              defaultValue={state?.formData?.confirmPassword || ''}
              error={!!state?.errors?.confirmPassword}
              helperText={state?.errors?.confirmPassword}
              sx={{ mb: 2 }}
            />
            <div className='password-toggle-icon' onClick={ () => setIsVisible(!isVisible) }>{ isVisible ? <Visibility/> : <VisibilityOff/> }</div>
            </div>
          
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress /> : null}
          >
            {user ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
