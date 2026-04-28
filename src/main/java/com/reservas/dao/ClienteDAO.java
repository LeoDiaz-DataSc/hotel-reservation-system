package com.reservas.dao;

import com.reservas.db.ConexionDB;
import com.reservas.model.Cliente;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ClienteDAO {
    private Connection conexion;
    
    public ClienteDAO() {
        conexion = ConexionDB.getConexion();
    }
    
    public void crearCliente(Cliente cliente) throws SQLException {
        String sql = "INSERT INTO Clientes (ID_Cliente, Nombre, Apellido, Email, Telefono) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, cliente.getIdCliente());
            stmt.setString(2, cliente.getNombre());
            stmt.setString(3, cliente.getApellido());
            stmt.setString(4, cliente.getEmail());
            stmt.setString(5, cliente.getTelefono());
            stmt.executeUpdate();
        }
    }
    
    public Cliente obtenerCliente(int id) throws SQLException {
        String sql = "SELECT * FROM Clientes WHERE ID_Cliente = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new Cliente(
                    rs.getInt("ID_Cliente"),
                    rs.getString("Nombre"),
                    rs.getString("Apellido"),
                    rs.getString("Email"),
                    rs.getString("Telefono")
                );
            }
            return null;
        }
    }
    
    public List<Cliente> obtenerTodosClientes() throws SQLException {
        List<Cliente> clientes = new ArrayList<>();
        String sql = "SELECT * FROM Clientes";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                clientes.add(new Cliente(
                    rs.getInt("ID_Cliente"),
                    rs.getString("Nombre"),
                    rs.getString("Apellido"),
                    rs.getString("Email"),
                    rs.getString("Telefono")
                ));
            }
        }
        return clientes;
    }
    
    public void actualizarCliente(Cliente cliente) throws SQLException {
        String sql = "UPDATE Clientes SET Nombre = ?, Apellido = ?, Email = ?, Telefono = ? WHERE ID_Cliente = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setString(1, cliente.getNombre());
            stmt.setString(2, cliente.getApellido());
            stmt.setString(3, cliente.getEmail());
            stmt.setString(4, cliente.getTelefono());
            stmt.setInt(5, cliente.getIdCliente());
            stmt.executeUpdate();
        }
    }
    
    public void eliminarCliente(int id) throws SQLException {
        String sql = "DELETE FROM Clientes WHERE ID_Cliente = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }
} 