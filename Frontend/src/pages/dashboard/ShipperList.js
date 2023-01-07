import { paramCase } from 'change-case';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  Button,
  Switch,
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
  DialogContent,
  TextField,
  Dialog,
  DialogActions,
  DialogTitle,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
// import { RHFTextField } from '../../components/hook-form';
import ShipperTableRow from '../../sections/@dashboard/shipper/list/ShipperTableRow';
import ShipperTableToolBar from '../../sections/@dashboard/shipper/list/ShipperTableToolBar';
import { DialogAnimate } from '../../components/animate';
import { FormProvider } from '../../components/hook-form';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getProducts } from '../../redux/slices/product';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import {
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedActions,
} from '../../components/table';
// sections

import { getBrands } from '../../redux/slices/brand';
import { getShippers, resetShipper } from '../../redux/slices/shipper';



// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'name', label: 'Họ tên', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'role', label: 'Quyền', align: 'left' },
  { id: 'gender', label: 'Giới tính', align: 'left' },
  { id: 'status', label: 'Trạng thái', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function ShipperList() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'createdAt',
  });
  const { enqueueSnackbar } = useSnackbar();
  const { shippers,newShipper, isLoading, error } = useSelector((state) => state.shipper);
  const { themeStretch } = useSettings();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const valueRef = useRef('');
  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old Password is required'),
    newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New Password is required'),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
  });

  const defaultValues = {
    name: '',
    color: '',
  };

  const methods = useForm({ defaultValues });

  const {
    reset,
    handleSubmit,
    register,
    // formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
    //   dispatch(createSize(data));
      console.log(data);
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 500));
      // reset();
      // enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
    }
  };


    // useEffect(() => {
    //   if (error) {
    //     enqueueSnackbar('Thêm shipper không thành công!', { variant: 'error' });
    //   } else if (newShipper) {
    //     console.log('234', newShipper);
    //     dispatch(getShippers());
    //     enqueueSnackbar('Thêm shipper thành công!');
    //     // navigate(PATH_DASHBOARD.user.list);
    //   }
    //   setTimeout(() => {
    //     dispatch(resetShipper());
    //   }, 3000);
    // }, [error, newShipper]);




  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = () => {
    setOpen(false);
    // dispatch(createBrand({ name: valueRef.current.value }));
  };

  const dispatch = useDispatch();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const [tableData, setTableData] = useState([]);
  console.log('first', tableData);
  console.log('shippers', shippers);
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    dispatch(getShippers());
  }, [dispatch]);

  useEffect(() => {
    if (shippers?.length) {
      setTableData(shippers);
    }
  }, [shippers]);

  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleDeleteRow = (id) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);
  };

  const handleDeleteRows = (selected) => {
    const deleteRows = tableData.filter((row) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);
  };

  const handleEditRow = (id) => {
    navigate(PATH_DASHBOARD.eCommerce.edit(paramCase(id)));
  };

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!dataFiltered.length && !!filterName) || (!isLoading && !dataFiltered.length);

  return (
    <Page title="Danh sách shipper">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Danh sách shipper"
          links={[
            { name: 'Trang chủ', href: PATH_DASHBOARD.root },
            { name: 'Shipper', href: PATH_DASHBOARD.shipper.root },
            { name: 'Danh sách' },
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_DASHBOARD.shipper.new}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              Thêm shipper
            </Button>
          }
        />
        <DialogAnimate
          open={open}
          onClose={handleClose}
          title={'Tạo kích thước'}
          onClickSubmit={handleSubmit(onSubmit)}
        >
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              {' '}
              <TextField
                name="name"
                type="text"
                label="Tên kích thước"
                {...register('name')}
                autoFocus
                margin="dense"
                fullWidth
                id="outlined-basic"
                variant="outlined"
              />
            </DialogContent>
          </FormProvider>
        </DialogAnimate>

        {/* <Dialog open={open}> */}
        {/* <FormProvider
          methods={methods}
          onSubmit={handleSubmit(onSubmit)}
         
        >
         
        
          <TextField
            autoFocus
            margin="dense"
            label="Tên kích thước"
            type="text"
            fullWidth
            name="name"
            id="outlined-basic"
            variant="outlined"
          />
          <TextField
            autoFocus
            margin="dense"
            label="Mã màu"
            type="text"
            fullWidth
            name="color"
            id="outlined-basic"
            variant="outlined"
          />
          
          <Button type="submit" variant="outlined">
            Tạo{' '}
          </Button>
        </FormProvider> */}
        {/* </Dialog> */}
        <Card>
          <ShipperTableToolBar filterName={filterName} onFilterName={handleFilterName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              {selected.length > 0 && (
                <TableSelectedActions
                  dense={dense}
                  numSelected={selected.length}
                  rowCount={tableData.length}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                  actions={
                    <Tooltip title="Delete">
                      <IconButton color="primary" onClick={() => handleDeleteRows(selected)}>
                        <Iconify icon={'eva:trash-2-outline'} />
                      </IconButton>
                    </Tooltip>
                  }
                />
              )}

              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {(isLoading ? [...Array(rowsPerPage)] : dataFiltered)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) =>
                      row ? (
                        <ShipperTableRow
                          key={row.id}
                          row={row}
                          selected={selected.includes(row.id)}
                          onSelectRow={() => onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.name)}
                        />
                      ) : (
                        !isNotFound && <TableSkeleton key={index} sx={{ height: denseHeight }} />
                      )
                    )}

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataFiltered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />
          </Box>
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ tableData, comparator, filterName }) {
  const stabilizedThis = tableData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tableData = tableData.filter((item) => item.fullName.toString().indexOf(filterName) !== -1);
  }

  return tableData;
}
