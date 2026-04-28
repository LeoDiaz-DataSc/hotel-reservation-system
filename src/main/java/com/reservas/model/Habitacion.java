package com.reservas.model;

public class Habitacion {
    private int idHabitacion;
    private String tipo;
    private double precioNoche;
    private String estado;
    private int piso;
    
    public Habitacion() {}
    
    public Habitacion(int idHabitacion, String tipo, double precioNoche, String estado, int piso) {
        this.idHabitacion = idHabitacion;
        this.tipo = tipo;
        this.precioNoche = precioNoche;
        this.estado = estado;
        this.piso = piso;
    }
    
    // Getters y Setters
    public int getIdHabitacion() {
        return idHabitacion;
    }
    
    public void setIdHabitacion(int idHabitacion) {
        this.idHabitacion = idHabitacion;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public double getPrecioNoche() {
        return precioNoche;
    }
    
    public void setPrecioNoche(double precioNoche) {
        this.precioNoche = precioNoche;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public int getPiso() {
        return piso;
    }
    
    public void setPiso(int piso) {
        this.piso = piso;
    }
    
    @Override
    public String toString() {
        return "Habitación " + idHabitacion + " - " + tipo + " (Piso " + piso + ")";
    }
} 