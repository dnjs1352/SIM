import time
import queue

class Event:
    def __init__(self, time, action):
        self.time = time  # Time when event should occur
        self.action = action  # Callable action to perform

    def __lt__(self, other):
        return self.time < other.time

class EventSimulator:
    def __init__(self):
        self.event_queue = queue.PriorityQueue()

    def schedule_event(self, delay, action):
        event_time = time.time() + delay
        event = Event(event_time, action)
        self.event_queue.put(event)

    def run(self):
        while not self.event_queue.empty():
            current_time = time.time()
            next_event = self.event_queue.get()

            if next_event.time > current_time:
                time.sleep(next_event.time - current_time)
            next_event.action()  # Execute the event action

# Example usage

def my_event():
    print('Event executed at', time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime()))

simulator = EventSimulator()
simulator.schedule_event(2, my_event)  # Schedule an event 2 seconds from now
simulator.run()