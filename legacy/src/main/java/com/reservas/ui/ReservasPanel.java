package com.reservas.ui;

import com.reservas.dao.ClienteDAO;
import com.reservas.dao.HabitacionDAO;
import com.reservas.dao.ReservaDAO;
import com.reservas.model.Cliente;
import com.reservas.model.Habitacion;
import com.reservas.model.Reserva;
import java.awt.*;
import java.sql.Date;
import java.sql.SQLException;
import java.util.List;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import javax.swing.table.DefaultTableModel;
import com.toedter.calendar.JDateChooser;

public class ReservasPanel extends JPanel {
    private ReservaDAO reservaDAO;
    private ClienteDAO clienteDAO;
    private HabitacionDAO habitacionDAO;
    private JTable tablaReservas;
    private DefaultTableModel modeloTabla;
    private JTextField txtId;
    private JComboBox<Cliente> comboCliente;
    private JComboBox<Habitacion> comboHabitacion;
    private JDateChooser fechaEntrada;
    private JDateChooser fechaSalida;
    
    public ReservasPanel() {
        reservaDAO = new ReservaDAO();
        clienteDAO = new ClienteDAO();
        habitacionDAO = new HabitacionDAO();
        setLayout(new BorderLayout(10, 10));
        setBorder(new EmptyBorder(10, 10, 10, 10));
        
        // Panel izquierdo para el formulario
        JPanel leftPanel = new JPanel(new BorderLayout(10, 10));
        leftPanel.setPreferredSize(new Dimension(300, 0));
        
        // Panel de formulario
        JPanel formularioPanel = new JPanel(new GridBagLayout());
        formularioPanel.setBorder(BorderFactory.createTitledBorder(
            BorderFactory.createEtchedBorder(), "Datos de la Reserva",
            TitledBorder.LEFT, TitledBorder.TOP));
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 5, 5, 5);
        
        // ID
        gbc.gridx = 0; gbc.gridy = 0;
        JLabel lblId = new JLabel("ID:");
        lblId.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(lblId, gbc);
        
        gbc.gridx = 1; gbc.gridy = 0;
        txtId = new JTextField(10);
        formularioPanel.add(txtId, gbc);
        
        // Cliente
        gbc.gridx = 0; gbc.gridy = 1;
        JLabel lblCliente = new JLabel("Cliente:");
        lblCliente.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(lblCliente, gbc);
        
        gbc.gridx = 1; gbc.gridy = 1;
        comboCliente = new JComboBox<>();
        comboCliente.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(comboCliente, gbc);
        
        // Habitación
        gbc.gridx = 0; gbc.gridy = 2;
        JLabel lblHabitacion = new JLabel("Habitación:");
        lblHabitacion.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(lblHabitacion, gbc);
        
        gbc.gridx = 1; gbc.gridy = 2;
        comboHabitacion = new JComboBox<>();
        comboHabitacion.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(comboHabitacion, gbc);
        
        // Fecha Entrada
        gbc.gridx = 0; gbc.gridy = 3;
        JLabel lblFechaEntrada = new JLabel("Fecha Entrada:");
        lblFechaEntrada.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(lblFechaEntrada, gbc);
        
        gbc.gridx = 1; gbc.gridy = 3;
        fechaEntrada = new JDateChooser();
        fechaEntrada.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(fechaEntrada, gbc);
        
        // Fecha Salida
        gbc.gridx = 0; gbc.gridy = 4;
        JLabel lblFechaSalida = new JLabel("Fecha Salida:");
        lblFechaSalida.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(lblFechaSalida, gbc);
        
        gbc.gridx = 1; gbc.gridy = 4;
        fechaSalida = new JDateChooser();
        fechaSalida.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        formularioPanel.add(fechaSalida, gbc);
        
        // Panel de botones
        JPanel botonesPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 5, 5));
        
        JButton btnAgregar = new JButton("Agregar");
        btnAgregar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnAgregar.setIcon(new ImageIcon(getClass().getResource("/icons/add.png")));
        btnAgregar.addActionListener(e -> agregarReserva());
        
        JButton btnActualizar = new JButton("Actualizar");
        btnActualizar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnActualizar.setIcon(new ImageIcon(getClass().getResource("/icons/update.png")));
        btnActualizar.addActionListener(e -> actualizarReserva());
        
        JButton btnEliminar = new JButton("Eliminar");
        btnEliminar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnEliminar.setIcon(new ImageIcon(getClass().getResource("/icons/delete.png")));
        btnEliminar.addActionListener(e -> eliminarReserva());
        
        JButton btnLimpiar = new JButton("Limpiar");
        btnLimpiar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnLimpiar.setIcon(new ImageIcon(getClass().getResource("/icons/clear.png")));
        btnLimpiar.addActionListener(e -> limpiarCampos());
        
        botonesPanel.add(btnAgregar);
        botonesPanel.add(btnActualizar);
        botonesPanel.add(btnEliminar);
        botonesPanel.add(btnLimpiar);
        
        leftPanel.add(formularioPanel, BorderLayout.CENTER);
        leftPanel.add(botonesPanel, BorderLayout.SOUTH);
        
        // Panel derecho para la tabla
        JPanel rightPanel = new JPanel(new BorderLayout(10, 10));
        rightPanel.setBorder(BorderFactory.createTitledBorder(
            BorderFactory.createEtchedBorder(), "Lista de Reservas",
            TitledBorder.LEFT, TitledBorder.TOP));
        
        // Modelo de tabla
        modeloTabla = new DefaultTableModel() {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        modeloTabla.addColumn("ID");
        modeloTabla.addColumn("Cliente");
        modeloTabla.addColumn("Habitación");
        modeloTabla.addColumn("Fecha Entrada");
        modeloTabla.addColumn("Fecha Salida");
        
        tablaReservas = new JTable(modeloTabla);
        tablaReservas.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        tablaReservas.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        tablaReservas.getTableHeader().setReorderingAllowed(false);
        tablaReservas.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                cargarDatosSeleccionados();
            }
        });
        
        JScrollPane scrollPane = new JScrollPane(tablaReservas);
        rightPanel.add(scrollPane, BorderLayout.CENTER);
        
        // Agregar paneles al panel principal
        add(leftPanel, BorderLayout.WEST);
        add(rightPanel, BorderLayout.CENTER);
        
        // Cargar datos iniciales
        cargarClientes();
        cargarHabitacionesDisponibles();
        cargarDatos();
    }
    
    private void cargarClientes() {
        try {
            comboCliente.removeAllItems();
            List<Cliente> clientes = clienteDAO.obtenerTodosClientes();
            for (Cliente cliente : clientes) {
                comboCliente.addItem(cliente);
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error al cargar clientes: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void cargarHabitacionesDisponibles() {
        try {
            comboHabitacion.removeAllItems();
            List<Habitacion> habitaciones = habitacionDAO.obtenerHabitacionesDisponibles();
            for (Habitacion habitacion : habitaciones) {
                comboHabitacion.addItem(habitacion);
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error al cargar habitaciones: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void cargarDatos() {
        try {
            modeloTabla.setRowCount(0);
            List<Reserva> reservas = reservaDAO.obtenerTodasReservas();
            for (Reserva reserva : reservas) {
                modeloTabla.addRow(new Object[]{
                    reserva.getIdReserva(),
                    reserva.getCliente().toString(),
                    reserva.getHabitacion().toString(),
                    reserva.getFechaEntrada(),
                    reserva.getFechaSalida()
                });
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error al cargar los datos: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void cargarDatosSeleccionados() {
        int filaSeleccionada = tablaReservas.getSelectedRow();
        if (filaSeleccionada >= 0) {
            txtId.setText(modeloTabla.getValueAt(filaSeleccionada, 0).toString());
            // Buscar y seleccionar el cliente y habitación correspondientes
            String clienteStr = modeloTabla.getValueAt(filaSeleccionada, 1).toString();
            String habitacionStr = modeloTabla.getValueAt(filaSeleccionada, 2).toString();
            
            for (int i = 0; i < comboCliente.getItemCount(); i++) {
                if (comboCliente.getItemAt(i).toString().equals(clienteStr)) {
                    comboCliente.setSelectedIndex(i);
                    break;
                }
            }
            
            for (int i = 0; i < comboHabitacion.getItemCount(); i++) {
                if (comboHabitacion.getItemAt(i).toString().equals(habitacionStr)) {
                    comboHabitacion.setSelectedIndex(i);
                    break;
                }
            }
            
            // Aquí deberías implementar la lógica para cargar las fechas
            // spinnerFechaEntrada.setValue(...);
            // spinnerFechaSalida.setValue(...);
        }
    }
    
    private void agregarReserva() {
        try {
            Reserva reserva = new Reserva(
                Integer.parseInt(txtId.getText()),
                (Cliente) comboCliente.getSelectedItem(),
                (Habitacion) comboHabitacion.getSelectedItem(),
                new Date(System.currentTimeMillis()), // Fecha actual como ejemplo
                new Date(System.currentTimeMillis() + 86400000) // Fecha actual + 1 día como ejemplo
            );
            reservaDAO.crearReserva(reserva);
            cargarDatos();
            cargarHabitacionesDisponibles();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Reserva agregada exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al agregar reserva: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void actualizarReserva() {
        try {
            Reserva reserva = new Reserva(
                Integer.parseInt(txtId.getText()),
                (Cliente) comboCliente.getSelectedItem(),
                (Habitacion) comboHabitacion.getSelectedItem(),
                new Date(System.currentTimeMillis()), // Fecha actual como ejemplo
                new Date(System.currentTimeMillis() + 86400000) // Fecha actual + 1 día como ejemplo
            );
            reservaDAO.actualizarReserva(reserva);
            cargarDatos();
            cargarHabitacionesDisponibles();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Reserva actualizada exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al actualizar reserva: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void eliminarReserva() {
        try {
            int id = Integer.parseInt(txtId.getText());
            reservaDAO.eliminarReserva(id);
            cargarDatos();
            cargarHabitacionesDisponibles();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Reserva eliminada exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al eliminar reserva: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void limpiarCampos() {
        txtId.setText("");
        comboCliente.setSelectedIndex(0);
        comboHabitacion.setSelectedIndex(0);
        fechaEntrada.setDate(null);
        fechaSalida.setDate(null);
    }
} 