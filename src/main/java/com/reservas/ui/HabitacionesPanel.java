package com.reservas.ui;

import com.reservas.dao.HabitacionDAO;
import com.reservas.model.Habitacion;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.sql.SQLException;
import java.util.List;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSpinner;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.SpinnerNumberModel;
import javax.swing.table.DefaultTableModel;

public class HabitacionesPanel extends JPanel {
    private HabitacionDAO habitacionDAO;
    private JTable tablaHabitaciones;
    private DefaultTableModel modeloTabla;
    private JTextField txtId, txtTipo;
    private JSpinner spinnerPrecio, spinnerPiso;
    private JComboBox<String> comboEstado;
    
    public HabitacionesPanel() {
        habitacionDAO = new HabitacionDAO();
        setLayout(new BorderLayout());
        
        // Panel de formulario
        JPanel formularioPanel = new JPanel(new GridLayout(5, 2, 10, 10));
        formularioPanel.setBackground(Color.WHITE);
        
        // Campos del formulario
        formularioPanel.add(new JLabel("ID:"));
        txtId = new JTextField();
        formularioPanel.add(txtId);
        
        formularioPanel.add(new JLabel("Tipo:"));
        txtTipo = new JTextField();
        formularioPanel.add(txtTipo);
        
        formularioPanel.add(new JLabel("Precio por noche:"));
        spinnerPrecio = new JSpinner(new SpinnerNumberModel(0.0, 0.0, 10000.0, 10.0));
        formularioPanel.add(spinnerPrecio);
        
        formularioPanel.add(new JLabel("Estado:"));
        comboEstado = new JComboBox<>(new String[]{"Disponible", "Ocupada", "Mantenimiento"});
        formularioPanel.add(comboEstado);
        
        formularioPanel.add(new JLabel("Piso:"));
        spinnerPiso = new JSpinner(new SpinnerNumberModel(1, 1, 20, 1));
        formularioPanel.add(spinnerPiso);
        
        // Panel de botones
        JPanel botonesPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        botonesPanel.setBackground(Color.WHITE);
        
        JButton btnAgregar = new JButton("Agregar");
        btnAgregar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnAgregar.addActionListener(e -> agregarHabitacion());
        
        JButton btnActualizar = new JButton("Actualizar");
        btnActualizar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnActualizar.addActionListener(e -> actualizarHabitacion());
        
        JButton btnEliminar = new JButton("Eliminar");
        btnEliminar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnEliminar.addActionListener(e -> eliminarHabitacion());
        
        JButton btnLimpiar = new JButton("Limpiar");
        btnLimpiar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnLimpiar.addActionListener(e -> limpiarCampos());
        
        botonesPanel.add(btnAgregar);
        botonesPanel.add(btnActualizar);
        botonesPanel.add(btnEliminar);
        botonesPanel.add(btnLimpiar);
        
        // Panel de tabla
        JPanel tablaPanel = new JPanel(new BorderLayout());
        tablaPanel.setBackground(Color.WHITE);
        
        // Modelo de tabla
        modeloTabla = new DefaultTableModel();
        modeloTabla.addColumn("ID");
        modeloTabla.addColumn("Tipo");
        modeloTabla.addColumn("Precio/Noche");
        modeloTabla.addColumn("Estado");
        modeloTabla.addColumn("Piso");
        
        tablaHabitaciones = new JTable(modeloTabla);
        tablaHabitaciones.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        tablaHabitaciones.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                cargarDatosSeleccionados();
            }
        });
        
        JScrollPane scrollPane = new JScrollPane(tablaHabitaciones);
        tablaPanel.add(scrollPane, BorderLayout.CENTER);
        
        // Agregar componentes al panel principal
        add(formularioPanel, BorderLayout.NORTH);
        add(botonesPanel, BorderLayout.CENTER);
        add(tablaPanel, BorderLayout.SOUTH);
        
        // Cargar datos iniciales
        cargarDatos();
    }
    
    private void cargarDatos() {
        try {
            modeloTabla.setRowCount(0);
            List<Habitacion> habitaciones = habitacionDAO.obtenerTodasHabitaciones();
            for (Habitacion habitacion : habitaciones) {
                modeloTabla.addRow(new Object[]{
                    habitacion.getIdHabitacion(),
                    habitacion.getTipo(),
                    habitacion.getPrecioNoche(),
                    habitacion.getEstado(),
                    habitacion.getPiso()
                });
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error al cargar los datos: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void cargarDatosSeleccionados() {
        int filaSeleccionada = tablaHabitaciones.getSelectedRow();
        if (filaSeleccionada >= 0) {
            txtId.setText(modeloTabla.getValueAt(filaSeleccionada, 0).toString());
            txtTipo.setText(modeloTabla.getValueAt(filaSeleccionada, 1).toString());
            spinnerPrecio.setValue(modeloTabla.getValueAt(filaSeleccionada, 2));
            comboEstado.setSelectedItem(modeloTabla.getValueAt(filaSeleccionada, 3));
            spinnerPiso.setValue(modeloTabla.getValueAt(filaSeleccionada, 4));
        }
    }
    
    private void agregarHabitacion() {
        try {
            Habitacion habitacion = new Habitacion(
                Integer.parseInt(txtId.getText()),
                txtTipo.getText(),
                (Double) spinnerPrecio.getValue(),
                (String) comboEstado.getSelectedItem(),
                (Integer) spinnerPiso.getValue()
            );
            habitacionDAO.crearHabitacion(habitacion);
            cargarDatos();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Habitación agregada exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al agregar habitación: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void actualizarHabitacion() {
        try {
            Habitacion habitacion = new Habitacion(
                Integer.parseInt(txtId.getText()),
                txtTipo.getText(),
                (Double) spinnerPrecio.getValue(),
                (String) comboEstado.getSelectedItem(),
                (Integer) spinnerPiso.getValue()
            );
            habitacionDAO.actualizarHabitacion(habitacion);
            cargarDatos();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Habitación actualizada exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al actualizar habitación: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void eliminarHabitacion() {
        try {
            int id = Integer.parseInt(txtId.getText());
            habitacionDAO.eliminarHabitacion(id);
            cargarDatos();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Habitación eliminada exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al eliminar habitación: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void limpiarCampos() {
        txtId.setText("");
        txtTipo.setText("");
        spinnerPrecio.setValue(0.0);
        comboEstado.setSelectedIndex(0);
        spinnerPiso.setValue(1);
    }
} 