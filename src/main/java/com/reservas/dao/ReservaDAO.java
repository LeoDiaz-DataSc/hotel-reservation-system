package com.reservas.dao;

import com.reservas.db.ConexionDB;
import com.reservas.model.Cliente;
import com.reservas.model.Habitacion;
import com.reservas.model.Reserva;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ReservaDAO {
    private Connection conexion;
    private ClienteDAO clienteDAO;
    private HabitacionDAO habitacionDAO;
    
    public ReservaDAO() {
        conexion = ConexionDB.getConexion();
        clienteDAO = new ClienteDAO();
        habitacionDAO = new HabitacionDAO();
    }
    
    public void crearReserva(Reserva reserva) throws SQLException {
        String sql = "INSERT INTO Reservas (ID_Reserva, ID_Cliente, ID_Habitacion, Fecha_Entrada, Fecha_Salida) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, reserva.getIdReserva());
            stmt.setInt(2, reserva.getCliente().getIdCliente());
            stmt.setInt(3, reserva.getHabitacion().getIdHabitacion());
            stmt.setDate(4, reserva.getFechaEntrada());
            stmt.setDate(5, reserva.getFechaSalida());
            stmt.executeUpdate();
            
            // Actualizar estado de la habitación
            Habitacion habitacion = reserva.getHabitacion();
            habitacion.setEstado("Ocupada");
            habitacionDAO.actualizarHabitacion(habitacion);
        }
    }
    
    public Reserva obtenerReserva(int id) throws SQLException {
        String sql = "SELECT * FROM Reservas WHERE ID_Reserva = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new Reserva(
                    rs.getInt("ID_Reserva"),
                    clienteDAO.obtenerCliente(rs.getInt("ID_Cliente")),
                    habitacionDAO.obtenerHabitacion(rs.getInt("ID_Habitacion")),
                    rs.getDate("Fecha_Entrada"),
                    rs.getDate("Fecha_Salida")
                );
            }
            return null;
        }
    }
    
    public List<Reserva> obtenerTodasReservas() throws SQLException {
        List<Reserva> reservas = new ArrayList<>();
        String sql = "SELECT * FROM Reservas";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                reservas.add(new Reserva(
                    rs.getInt("ID_Reserva"),
                    clienteDAO.obtenerCliente(rs.getInt("ID_Cliente")),
                    habitacionDAO.obtenerHabitacion(rs.getInt("ID_Habitacion")),
                    rs.getDate("Fecha_Entrada"),
                    rs.getDate("Fecha_Salida")
                ));
            }
        }
        return reservas;
    }
    
    public void actualizarReserva(Reserva reserva) throws SQLException {
        String sql = "UPDATE Reservas SET ID_Cliente = ?, ID_Habitacion = ?, Fecha_Entrada = ?, Fecha_Salida = ? WHERE ID_Reserva = ?";
        try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
            stmt.setInt(1, reserva.getCliente().getIdCliente());
            stmt.setInt(2, reserva.getHabitacion().getIdHabitacion());
            stmt.setDate(3, reserva.getFechaEntrada());
            stmt.setDate(4, reserva.getFechaSalida());
            stmt.setInt(5, reserva.getIdReserva());
            stmt.executeUpdate();
        }
    }
    
    public void eliminarReserva(int id) throws SQLException {
        // Primero obtener la reserva para actualizar el estado de la habitación
        Reserva reserva = obtenerReserva(id);
        if (reserva != null) {
            // Actualizar estado de la habitación a disponible
            Habitacion habitacion = reserva.getHabitacion();
            habitacion.setEstado("Disponible");
            habitacionDAO.actualizarHabitacion(habitacion);
            
            // Eliminar la reserva
            String sql = "DELETE FROM Reservas WHERE ID_Reserva = ?";
            try (PreparedStatement stmt = conexion.prepareStatement(sql)) {
                stmt.setInt(1, id);
                stmt.executeUpdate();
            }
        }
    }
} 