

from __future__ import print_function
import keras
from keras.datasets import cifar10
from keras.preprocessing.image import ImageDataGenerator
from keras.layers import Input, Convolution2D, MaxPooling2D, Flatten, Conv2D, \
        GlobalAveragePooling2D, Dense, Dropout, BatchNormalization, Activation
from keras.models import Model, Sequential
import os
from keras.callbacks import Callback, ModelCheckpoint

import sklearn.datasets

from argparse import ArgumentParser
from keras.preprocessing import image
import numpy as np
from numpy import argmax

import csv
import glob

from chars_segment import chars_segment_from_file, chars_segment


CHECKPOINT_FILE = 'data/w_digits.hdf5'

num_classes = 10
img_size = 32

def main():
    parser = build_parser()
    opts = parser.parse_args()

    #valid7digit(opts)

    recognizor = DigitsRecognizor(opts.checkpoint_file)

    digits = recognizor.predict_from_file(opts.img_file)
    print(digits)

class DigitsRecognizor:
    def __init__(self, weights_file):
        self.char_recognizor = CharRecognition(weights_file)


    def predict_from_file(self, img_file):
        results = []
        all_digits = chars_segment_from_file(img_file,sized_to = img_size)

        for digit in all_digits:
            if digit['dtype'] == 'char':
                d = self.char_recognizor.reg_char(digit['data'])
                
                results.append(str(d))
            else :   
                results.append('.')

        print(results)
        return ''.join(results)

    def predict(self, img):
        results = []
        all_digits = chars_segment(img, sized_to = img_size)

        # i = 0
        # import cv2

        for digit in all_digits:
            if digit['dtype'] == 'char':
                d = self.char_recognizor.reg_char(digit['data'])
                # cv2.imshow(str(i), digit['data'])
                # cv2.waitKey(0)
                
                results.append(str(d))
            else :   
                results.append('.')

        print(results)
        return ''.join(results)

class CharRecognition:
    def __init__(self, weights_file):
        self.model = build_model(input_shape=(img_size,img_size,1),num_classes=num_classes)

        if weights_file is not None and os.path.exists(weights_file):
            self.model.load_weights(weights_file)
        else:
            print('invalid weight file:',weights_file)

    def reg_char_file(self, img_file):

        print('testing ',img_file)
        img = image.load_img(img_file, grayscale=True, target_size=(img_size, img_size))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x /= 255.0

        preds = self.model.predict(x)
        # decode the results into a list of tuples (class, description, probability)
        # (one such list for each sample in the batch)
        print('Predicted:',preds)
        print('to result:',argmax(preds))

        return argmax(preds)

    def reg_char(self, img):

        #x = image.img_to_array(img)
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x /= 255.0

        preds = self.model.predict(x)
        # # decode the results into a list of tuples (class, description, probability)
        # # (one such list for each sample in the batch)
        # print('Predicted:',preds)
        # print('to result:',argmax(preds))

        return argmax(preds)

def valid7digit(opts):
    img_dir = '/Users/robert/7digit/'
    files = glob.glob(os.path.join(img_dir,'*.jpg'))
    #print files
    #files = ['/Users/robert/7digit/digit00058.jpg','/Users/robert/7digit/digit00049.jpg']
    
    ocr_results = []
    
    import csv
    
    gts = {}
    with open('data/gt.csv', 'rU') as gt_csv:
        reader = csv.reader(gt_csv,dialect='excel')
        #reader = csv.reader(open(self.file, 'rU'), dialect=csv.excel_tab)
        for row in reader:
            #print row
            gts[row[0]] = row[1]

    recognizor = DigitsRecognizor(opts.checkpoint_file)

    
    with open('ocr_results.csv', 'w') as csvfile:
        fieldnames = ['image_name', 'predict','ground_true','correct']
        writer = csv.writer(csvfile) #, fieldnames=fieldnames)

        writer.writerow(fieldnames)

        for img_path in files:                        
            img_name = img_path.split('/')[-1]
            img_name = img_name.split('.')[0]
            ground_true = gts[img_name]
            print( 'processing:', img_name)

            digits = recognizor.predict(img_path)
            print(digits)

            writer.writerow([img_name, digits,ground_true,digits == ground_true])
        
    csvfile.close()
    print( 'finished')


def build_model(input_shape, num_classes):

	img_input = Input(shape=input_shape)

	x = Convolution2D(32, (3, 3), strides=(1, 1), padding='same')(img_input)
	x = BatchNormalization()(x)
	x = Activation('relu')(x)

	x = Convolution2D(32, (3, 3), strides=(1, 1), padding='same')(img_input)
	x = BatchNormalization()(x)
	x = Activation('relu')(x)

	x = Convolution2D(64, (3, 3), strides=(1, 1), padding='same')(x)
	x = BatchNormalization()(x)
	x = Activation('relu')(x)

	x = Convolution2D(64, (3, 3), strides=(2, 2), padding='same')(x)
	x = BatchNormalization()(x)
	x = Activation('relu')(x)

	x = Convolution2D(512, (3, 3), strides=(2, 2), padding='same')(x)
	x = BatchNormalization()(x)
	x = Activation('relu')(x)

	x = Convolution2D(512, (1, 1), strides=(1, 1), padding='same')(x)
	x = BatchNormalization()(x)
	x = Activation('relu')(x)
	  
	x = GlobalAveragePooling2D()(x)

	x = Dropout(0.5)(x)

	out = Dense(num_classes, activation='softmax')(x)

	model = Model(img_input, out, name='digits')

	return model

def build_parser():
    parser = ArgumentParser()

    parser.add_argument('--checkpoint', type=str,
        dest='checkpoint_file', help='checkpoint',
        metavar='checkpoint', default=CHECKPOINT_FILE)

    parser.add_argument('--image-file', type=str,
        dest='img_file', help='img_file',
        metavar='img_file')



    return parser

def show_model():
    model = build_model(input_shape=(224,224,3), num_classes=10)
    from keras.optimizers import SGD
    model.compile(optimizer=SGD(lr=0.0001, momentum=0.9), loss='categorical_crossentropy')

    model.summary()


if __name__ == '__main__':
  main()
  #show_model()
