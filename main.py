from manufacturing_simulator import ManufacturingSimulator


if __name__ == '__main__':
    # Initialize the ManufacturingSimulator with 5 machines and 100 products per day
    simulator = ManufacturingSimulator(num_machines=5, products_per_day=100)

    # Run the simulation for 480 minutes
    simulator.run_simulation(simulation_time=480)

    # Display results and visualizations
    simulator.display_results()
    simulator.visualize_results()