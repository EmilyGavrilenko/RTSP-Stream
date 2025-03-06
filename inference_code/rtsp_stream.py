from inference import InferencePipeline
import cv2
import time
import numpy as np
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

from supabase import create_client


def convert_to_datetime(timestamp):
    print("timestamp", timestamp)
    return datetime.utcfromtimestamp(timestamp).isoformat()


class CameraTracker:
    def __init__(self, feed_connect_id):
        self.feed_connect_id = feed_connect_id
        self.zone_time = 0
        self.zone_in = 0
        self.zone_out = 0
        self.line1_in = 0
        self.line1_out = 0
        self.line2_in = 0
        self.line2_out = 0
        self.cache = {}  # Track items currently in the zone
        self.last_export_time = time.time()
        self.count = 0

        # Track object IDs and timestamps
        self.line1_in_objects = {}  # {detection_id: timestamp}
        self.line1_out_objects = {}
        self.line2_in_objects = {}
        self.line2_out_objects = {}
        self.zone_objects = (
            {}
        )  # {detection_id: {"time_in": timestamp, "time_out": timestamp, "duration": seconds}}

        # Initialize Supabase client
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    def process_api_response(self, response):
        current_time = time.time()

        # Line1: Process detections_in and increase line1_in
        for detection_id in response["line_counter_1"]["detections_in"].data.get(
            "detection_id", []
        ):
            self.line1_in += 1
            self.line1_in_objects[detection_id] = current_time

        # Line1: Process detections_out and increase line1_out
        for detection_id in response["line_counter_1"]["detections_out"].data.get(
            "detection_id", []
        ):
            self.line1_out += 1
            self.line1_out_objects[detection_id] = current_time

        # Line2: Process detections_in and increase line2_in
        for detection_id in response["line_counter_2"]["detections_in"].data.get(
            "detection_id", []
        ):
            self.line2_in += 1
            self.line2_in_objects[detection_id] = current_time

        # Line2: Process detections_out and increase line2_out
        for detection_id in response["line_counter_2"]["detections_out"].data.get(
            "detection_id", []
        ):
            self.line2_out += 1
            self.line2_out_objects[detection_id] = current_time

        # Process time_in_zone and update cache
        time_in_zone = response["time_in_zone"]
        detections_on_screen = time_in_zone.data.get("detection_id", [])
        detections_currently_in_zone = []
        if detections_on_screen is not None and len(detections_on_screen) > 0:
            print("time_in_zone", time_in_zone)
            for idx, detection_id in enumerate(detections_on_screen):
                in_zone = time_in_zone.data.get("time_in_zone", [])[idx] > 0
                if in_zone:
                    if detection_id not in self.cache:
                        self.zone_in += 1
                        self.zone_objects[detection_id] = {
                            "time_in": current_time,
                            "time_out": None,
                            "duration": None,
                        }
                        self.cache[detection_id] = {}
                    self.cache[detection_id]["time_in_zone"] = time_in_zone.data[
                        "time_in_zone"
                    ][idx]
                    self.cache[detection_id]["last_updated"] = current_time
                    detections_currently_in_zone = np.append(
                        detections_currently_in_zone, detection_id
                    )

        # Check for detections that have left the zone
        items_to_remove = []
        delay_to_remove = (
            5  # 5 second delay after a person leaves the zone to increase zone_out
        )
        for detection_id, data in self.cache.items():
            if (
                detection_id not in detections_currently_in_zone
                and current_time - data["last_updated"] > delay_to_remove
            ):
                object_time_in_zone = self.get_object_time_in_zone(detection_id)
                self.zone_time += object_time_in_zone
                self.zone_out += 1
                print(data["last_updated"], "duration", object_time_in_zone)
                self.zone_objects[detection_id]["time_out"] = data["last_updated"]
                self.zone_objects[detection_id]["duration"] = object_time_in_zone
                items_to_remove.append(detection_id)

        for detection_id in items_to_remove:
            del self.cache[detection_id]

        # Export data every 5 seconds
        export_duration = 5
        # print("diff", time.time() - self.last_export_time)
        if time.time() - self.last_export_time > export_duration:
            self.last_export_time = time.time()
            self.sync_zone_time()
            current_data = self.get_current_data()
            # print(current_data)
            self.save_to_supabase(self.format_data_for_supabase())

        self.save_image_to_supabase(response)

    def sync_zone_time(self):
        cache = self.cache
        for detection_id, data in cache.items():
            object_time_in_zone = self.get_object_time_in_zone(detection_id)
            self.zone_time += object_time_in_zone
            self.cache[detection_id]["previous_time_in_zone"] = data["time_in_zone"]

    def get_object_time_in_zone(self, detection_id):
        data = self.cache[detection_id]
        object_time_in_zone = data["time_in_zone"]
        if data.get("previous_time_in_zone") and data["previous_time_in_zone"] > 0:
            object_time_in_zone -= data["previous_time_in_zone"]
        return object_time_in_zone

    def get_current_data(self):
        return {
            "feed_connect_id": self.feed_connect_id,
            "zone_time": self.zone_time,
            "zone_in": self.zone_in,
            "zone_out": self.zone_out,
            "line1_in": self.line1_in,
            "line1_out": self.line1_out,
            "line2_in": self.line2_in,
            "line2_out": self.line2_out,
        }

    def format_data_for_supabase(self):
        timestamp = convert_to_datetime(time.time())
        zone_enterings = []
        # Create a list of items to remove to avoid modifying dict during iteration
        items_to_remove = []
        for detection_id, data in self.zone_objects.items():
            if data["time_out"] is not None:
                zone_enterings.append(
                    {
                        "camera_location": self.feed_connect_id,
                        "detection_id": str(detection_id),
                        "time_in": convert_to_datetime(data["time_in"]),
                        "time_out": convert_to_datetime(data["time_out"]),
                        "duration": data["duration"],
                        "timestamp": timestamp,
                    }
                )
                items_to_remove.append(detection_id)

        # Remove items after iteration is complete
        for detection_id in items_to_remove:
            del self.zone_objects[detection_id]

        line_crossings = []
        to_delete = {"line1_in": [], "line1_out": [], "line2_in": [], "line2_out": []}
        # Add line 1 crossings
        for detection_id, cross_time in self.line1_in_objects.items():
            line_crossings.append(
                {
                    "camera_location": self.feed_connect_id,
                    "line_number": 1,
                    "direction": "in",
                    "detection_id": str(detection_id),
                    "timestamp": convert_to_datetime(cross_time),
                }
            )
            to_delete["line1_in"].append(detection_id)
        for detection_id, cross_time in self.line1_out_objects.items():
            line_crossings.append(
                {
                    "camera_location": self.feed_connect_id,
                    "line_number": 1,
                    "direction": "out",
                    "detection_id": str(detection_id),
                    "timestamp": convert_to_datetime(cross_time),
                }
            )
            to_delete["line1_out"].append(detection_id)
        # Add line 2 crossings
        for detection_id, cross_time in self.line2_in_objects.items():
            line_crossings.append(
                {
                    "camera_location": self.feed_connect_id,
                    "line_number": 2,
                    "direction": "in",
                    "detection_id": str(detection_id),
                    "timestamp": convert_to_datetime(cross_time),
                }
            )
            to_delete["line2_in"].append(detection_id)

        for detection_id, cross_time in self.line2_out_objects.items():
            line_crossings.append(
                {
                    "camera_location": self.feed_connect_id,
                    "line_number": 2,
                    "direction": "out",
                    "detection_id": str(detection_id),
                    "timestamp": convert_to_datetime(cross_time),
                }
            )
            to_delete["line2_out"].append(detection_id)

        for detection_id in to_delete["line1_in"]:
            del self.line1_in_objects[detection_id]
        for detection_id in to_delete["line1_out"]:
            del self.line1_out_objects[detection_id]
        for detection_id in to_delete["line2_in"]:
            del self.line2_in_objects[detection_id]
        for detection_id in to_delete["line2_out"]:
            del self.line2_out_objects[detection_id]

        return {"zone_enterings": zone_enterings, "line_crossings": line_crossings}

    def save_to_supabase(self, data):
        print("Saving data to Supabase")
        print(data)
        try:
            if data["zone_enterings"]:
                self.supabase.table("camera_zones").insert(
                    data["zone_enterings"]
                ).execute()
            if data["line_crossings"]:
                self.supabase.table("camera_lines").insert(
                    data["line_crossings"]
                ).execute()
            print("Successfully saved data to Supabase")
        except Exception as e:
            print(f"Error saving to Supabase: {str(e)}")

    def save_image_to_supabase(self, result):
        global tracker
        tracker.count += 1
        try:

            # Convert numpy image to bytes
            is_success, buffer = cv2.imencode(
                ".jpg", result["output_image"].numpy_image
            )
            if is_success and self.count % 4 == 0:
                tracker.count = 0
                file_bytes = buffer.tobytes()

                # Generate unique filename using timestamp
                timestamp = int(time.time())
                filename = f"sf_hub_stream.jpg"

                # Create bucket if it doesn't exist
                try:
                    tracker.supabase.storage.create_bucket(
                        "rtsp-stream",
                        options={
                            "public": True
                        },  # Set to True if you want the files to be publicly accessible
                    )
                except Exception as e:
                    # Bucket might already exist, which is fine
                    pass

                # Upload to Supabase storage
                tracker.supabase.storage.from_("rtsp-stream").upload(
                    path=filename,
                    file=file_bytes,
                    file_options={"content-type": "image/jpeg", "upsert": "true"},
                )
                print(f"Successfully saved image to Supabase storage: {filename}")
        except Exception as e:
            print(f"Error saving image to Supabase storage: {str(e)}")


tracker = CameraTracker(feed_connect_id="home")


def my_sink(result, video_frame):
    global tracker
    if result.get("output_image"):  # Display an image from the workflow response
        cv2.imshow("Workflow Image", result["output_image"].numpy_image)
        cv2.imwrite(f"output_image_sf2.jpg", result["output_image"].numpy_image)
        cv2.waitKey(1)
    # print(result)  # do something with the predictions of each frame
    print(tracker.get_current_data())
    print("")
    tracker.process_api_response(result)


def my_sink_view_images(result, video_frame):
    if result.get("output_image"):  # Display an image from the workflow response
        cv2.imshow("Workflow Image", result["output_image"].numpy_image)
        cv2.waitKey(1)


def my_sink_save_images(result, video_frame):
    global tracker
    tracker.count += 1
    if result.get("output_image"):  # Display an image from the workflow response
        cv2.imshow("Workflow Image", result["output_image"].numpy_image)
        cv2.waitKey(1)
        cv2.imwrite(f"output_image_sf2.jpg", result["output_image"].numpy_image)
    print(result)  # do something with the predictions of each frame
    # Save image to Supabase storage
    try:

        # Convert numpy image to bytes
        is_success, buffer = cv2.imencode(".jpg", result["output_image"].numpy_image)
        if is_success and tracker.count % 10 == 0:
            tracker.count = 0
            file_bytes = buffer.tobytes()

            # Generate unique filename using timestamp
            timestamp = int(time.time())
            filename = f"home_webcam.jpg"

            # Create bucket if it doesn't exist
            try:
                tracker.supabase.storage.create_bucket(
                    "rtsp-stream",
                    options={
                        "public": True
                    },  # Set to True if you want the files to be publicly accessible
                )
            except Exception as e:
                # Bucket might already exist, which is fine
                pass

            # Upload to Supabase storage
            tracker.supabase.storage.from_("rtsp-stream").upload(
                path=filename,
                file=file_bytes,
                file_options={"content-type": "image/jpeg", "upsert": "true"},
            )
            print(f"Successfully saved image to Supabase storage: {filename}")
    except Exception as e:
        print(f"Error saving image to Supabase storage: {str(e)}")

    print(tracker.get_current_data())
    print("")
    tracker.process_api_response(result)


pipeline = InferencePipeline.init_with_workflow(
    api_key=os.getenv("ROBOFLOW_API_KEY"),
    workspace_name="roboflow-emily",
    workflow_id="rtsp-stream-sf",
    video_reference=os.getenv("RTSP_URL"),
    max_fps=30,
    on_prediction=my_sink,
)
pipeline.start()  # start the pipeline
pipeline.join()  # wait for the pipeline thread to finish
