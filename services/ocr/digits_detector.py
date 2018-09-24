import sys
import glob
import os
from PIL import Image
import numpy as np
import base64
import cPickle
import time
import cv2
from argparse import ArgumentParser

from cStringIO import StringIO
import pyDarknet

from digits_recognizor import DigitsRecognizor

gpu = 0

cnt = 0


DETECTOR_WEIGHT = 'model/yolo-digits_final.weights'
RECOGNIZOR_WEIGHT = 'model/w_digits.hdf5'

BASE_PATH = ''

class OCR():
    def __init__(self, detector_weight=DETECTOR_WEIGHT, recognizor_weight=RECOGNIZOR_WEIGHT):
        self.detector = pyDarknet.ObjectDetector('cfg/yolo-digits.cfg', detector_weight)

        self.recognizor = DigitsRecognizor(recognizor_weight)

    def predict(self, im_file):
        img = cv2.imread(im_file)
        im_org = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        rst, rt = self.detector.detect_object(im_file)
        image_name = im_file.split('/')[-1]
        #image_name = image_name.split('.')[0]

        print('found %d bbox in %s' %(len(rst),image_name))
        results = []
        for i in range(len(rst)):

            bbox = adjust_bbox(rst[i])

            roi = im_org[bbox.top:bbox.bottom,bbox.left:bbox.right]
            # cv2.imshow(str(i), roi)
            # cv2.waitKey(0)
            # cv2.imwrite('roi_%s.jpg' %(i,) ,roi)
            digits = self.recognizor.predict(roi)
            draw_box(im_org,bbox,digits)
            #results.push({'boundingBox':bbox, 'label':digits})
            results.append(digits)



            print('bbox[%s,%s-%s,%s]:%s' % (bbox.top, bbox.left,bbox.bottom,bbox.right, digits))

        out_img_file = os.path.join('out', 'r_'+image_name) 
        cv2.imwrite(out_img_file,im_org)

        return results, out_img_file



def main():
    parser = build_parser()
    opts = parser.parse_args()


    detector = OCR(opts.detector_weight, opts.recognizor_weight)

    digits, out_img_file = detector.predict(opts.img_file)
    print out_img_file



def adjust_bbox(bbox):
	offset = 1
	bbox.top -= offset
	bbox.left -= offset
	bbox.bottom += offset
	bbox.right += offset
	return bbox

def adjust_bbox2(bbox):
    return bbox

def draw_box(im, bbox, label,color=(0,255,0),thickness = 2):
    cv2.rectangle(im, (bbox.left, bbox.top), (bbox.right, bbox.bottom), color,	thickness = thickness)

    #set label
    fontface = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.8
    # http://docs.opencv.org/modules/core/doc/drawing_functions.html#gettextsize
    # Returns bounding box and baseline -> ((width, height), baseline)
    size = cv2.getTextSize(label, fontface, scale, thickness)[0]
    #print size
    label_top_left = (bbox.left-1, bbox.top - size[1]-2)
    cv2.rectangle(im, label_top_left, (bbox.left+size[0]+2,bbox.top), color,	thickness = -1)
    cv2.putText(im, label, (bbox.left, bbox.top-2), fontface, scale*0.8, (0,0,0), thickness)


def build_parser():
    parser = ArgumentParser()

    parser.add_argument('--detector_weight', type=str,
        dest='detector_weight',
        metavar='detector weight file', default=DETECTOR_WEIGHT)

    parser.add_argument('--recognizor_weight', type=str,
        dest='recognizor_weight',
        metavar='recognizor weight file', default=RECOGNIZOR_WEIGHT)

    parser.add_argument('--image-file', type=str,
        dest='img_file', help='img_file',
        metavar='img_file', required=True)

    return parser


if __name__ == '__main__':
    main()

