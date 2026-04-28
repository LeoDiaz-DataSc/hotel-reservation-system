package com.reservas.ui;

import com.reservas.dao.ClienteDAO;
import com.reservas.model.Cliente;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.sql.SQLException;
import java.util.List;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;

public class ClientesPanel extends JPanel {
    private ClienteDAO clienteDAO;
    private JTable tablaClientes;
    private DefaultTableModel modeloTabla;
    private JTextField txtId, txtNombre, txtApellido, txtEmail, txtTelefono;
    
    public ClientesPanel() {
        clienteDAO = new ClienteDAO();
        setLayout(new BorderLayout());
        
        // Panel de formulario
        JPanel formularioPanel = new JPanel(new GridLayout(5, 2, 10, 10));
        formularioPanel.setBackground(Color.WHITE);
        
        // Campos del formulario
        formularioPanel.add(new JLabel("ID:"));
        txtId = new JTextField();
        formularioPanel.add(txtId);
        
        formularioPanel.add(new JLabel("Nombre:"));
        txtNombre = new JTextField();
        formularioPanel.add(txtNombre);
        
        formularioPanel.add(new JLabel("Apellido:"));
        txtApellido = new JTextField();
        formularioPanel.add(txtApellido);
        
        formularioPanel.add(new JLabel("Email:"));
        txtEmail = new JTextField();
        formularioPanel.add(txtEmail);
        
        formularioPanel.add(new JLabel("Teléfono:"));
        txtTelefono = new JTextField();
        formularioPanel.add(txtTelefono);
        
        // Panel de botones
        JPanel botonesPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        botonesPanel.setBackground(Color.WHITE);
        
        JButton btnAgregar = new JButton("Agregar");
        btnAgregar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnAgregar.addActionListener(e -> agregarCliente());
        
        JButton btnActualizar = new JButton("Actualizar");
        btnActualizar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnActualizar.addActionListener(e -> actualizarCliente());
        
        JButton btnEliminar = new JButton("Eliminar");
        btnEliminar.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        btnEliminar.addActionListener(e -> eliminarCliente());
        
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
        modeloTabla.addColumn("Nombre");
        modeloTabla.addColumn("Apellido");
        modeloTabla.addColumn("Email");
        modeloTabla.addColumn("Teléfono");
        
        tablaClientes = new JTable(modeloTabla);
        tablaClientes.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        tablaClientes.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                cargarDatosSeleccionados();
            }
        });
        
        JScrollPane scrollPane = new JScrollPane(tablaClientes);
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
            List<Cliente> clientes = clienteDAO.obtenerTodosClientes();
            for (Cliente cliente : clientes) {
                modeloTabla.addRow(new Object[]{
                    cliente.getIdCliente(),
                    cliente.getNombre(),
                    cliente.getApellido(),
                    cliente.getEmail(),
                    cliente.getTelefono()
                });
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error al cargar los datos: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void cargarDatosSeleccionados() {
        int filaSeleccionada = tablaClientes.getSelectedRow();
        if (filaSeleccionada >= 0) {
            txtId.setText(modeloTabla.getValueAt(filaSeleccionada, 0).toString());
            txtNombre.setText(modeloTabla.getValueAt(filaSeleccionada, 1).toString());
            txtApellido.setText(modeloTabla.getValueAt(filaSeleccionada, 2).toString());
            txtEmail.setText(modeloTabla.getValueAt(filaSeleccionada, 3).toString());
            txtTelefono.setText(modeloTabla.getValueAt(filaSeleccionada, 4).toString());
        }
    }
    
    private void agregarCliente() {
        try {
            Cliente cliente = new Cliente(
                Integer.parseInt(txtId.getText()),
                txtNombre.getText(),
                txtApellido.getText(),
                txtEmail.getText(),
                txtTelefono.getText()
            );
            clienteDAO.crearCliente(cliente);
            cargarDatos();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Cliente agregado exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al agregar cliente: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void actualizarCliente() {
        try {
            Cliente cliente = new Cliente(
                Integer.parseInt(txtId.getText()),
                txtNombre.getText(),
                txtApellido.getText(),
                txtEmail.getText(),
                txtTelefono.getText()
            );
            clienteDAO.actualizarCliente(cliente);
            cargarDatos();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Cliente actualizado exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al actualizar cliente: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void eliminarCliente() {
        try {
            int id = Integer.parseInt(txtId.getText());
            clienteDAO.eliminarCliente(id);
            cargarDatos();
            limpiarCampos();
            JOptionPane.showMessageDialog(this, "Cliente eliminado exitosamente",
                    "Éxito", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Error al eliminar cliente: " + e.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void limpiarCampos() {
        txtId.setText("");
        txtNombre.setText("");
        txtApellido.setText("");
        txtEmail.setText("");
        txtTelefono.setText("");
    }
} 