class Product:
    def __init__(self, name, weight, value):
        self.name = name
        self.weight = weight
        self.value = value

    def __str__(self):
        return f'Product(name={self.name}, weight={self.weight}, value={self.value})'

class Machine:
    def __init__(self, id, efficiency):
        self.id = id
        self.efficiency = efficiency

    def produce(self, product):
        return f'Machine {self.id} produced {product}'

def generate_products(product_data):
    products = []
    for data in product_data:
        product = Product(data['name'], data['weight'], data['value'])
        products.append(product)
    return products