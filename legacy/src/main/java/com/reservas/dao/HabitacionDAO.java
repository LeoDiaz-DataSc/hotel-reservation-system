package com.reservas.dao;

import com.reservas.db.ConexionDB;
import com.reservas.model.Habitacion;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class HabitacionDAO {
    private Connection conexion;
    
    public HabitacionDAO() {
        conexion = ConexionDB.getConexion();
    }
    
    public void crearHabitacion(Habitacion habitacion) throws SQLException {
        String sql = "INSERT INTO Habitaciones (ID_Habitacion, Tipo, Precio_noche, Estado, Piso) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, habitacion.getIdHabitacion());
            stmt.setString(2, habitacion.getTipo());
            stmt.setDouble(3, habitacion.getPrecioNoche());
            stmt.setString(4, habitacion.getEstado());
            stmt.setInt(5, habitacion.getPiso());
            stmt.executeUpdate();
        }
    }
    
    public Habitacion obtenerHabitacion(int id) throws SQLException {
        String sql = "SELECT * FROM Habitaciones WHERE ID_Habitacion = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new Habitacion(
                    rs.getInt("ID_Habitacion"),
                    rs.getString("Tipo"),
                    rs.getDouble("Precio_noche"),
                    rs.getString("Estado"),
                    rs.getInt("Piso")
                );
            }
            return null;
        }
    }
    
    public List<Habitacion> obtenerTodasHabitaciones() throws SQLException {
        List<Habitacion> habitaciones = new ArrayList<>();
        String sql = "SELECT * FROM Habitaciones";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                habitaciones.add(new Habitacion(
                    rs.getInt("ID_Habitacion"),
                    rs.getString("Tipo"),
                    rs.getDouble("Precio_noche"),
                    rs.getString("Estado"),
                    rs.getInt("Piso")
                ));
            }
        }
        return habitaciones;
    }
    
    public void actualizarHabitacion(Habitacion habitacion) throws SQLException {
        String sql = "UPDATE Habitaciones SET Tipo = ?, Precio_noche = ?, Estado = ?, Piso = ? WHERE ID_Habitacion = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setString(1, habitacion.getTipo());
            stmt.setDouble(2, habitacion.getPrecioNoche());
            stmt.setString(3, habitacion.getEstado());
            stmt.setInt(4, habitacion.getPiso());
            stmt.setInt(5, habitacion.getIdHabitacion());
            stmt.executeUpdate();
        }
    }
    
    public void eliminarHabitacion(int id) throws SQLException {
        String sql = "DELETE FROM Habitaciones WHERE ID_Habitacion = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }
    
    public List<Habitacion> obtenerHabitacionesDisponibles() throws SQLException {
        List<Habitacion> habitaciones = new ArrayList<>();
        String sql = "SELECT * FROM Habitaciones WHERE Estado = 'Disponible'";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                habitaciones.add(new Habitacion(
                    rs.getInt("ID_Habitacion"),
                    rs.getString("Tipo"),
                    rs.getDouble("Precio_noche"),
                    rs.getString("Estado"),
                    rs.getInt("Piso")
                ));
            }
        }
        return habitaciones;
    }
} 