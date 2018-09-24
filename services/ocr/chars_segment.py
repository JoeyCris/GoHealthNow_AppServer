import numpy as np
#import imutils
import os

from PIL import Image


import cv2
import csv
import glob

from skimage.morphology import disk
from skimage.filters import rank

root_path = '/Users/robert/7digit'
show_img = True

def img_show_hook(title, img):
    global show_img
    if show_img:
        cv2.imshow(title, img)
        cv2.waitKey(500)    
    return

def main():


    true_labels = get_true_labels()
    files = glob.glob(os.path.join(root_path,'*.jpg'))
    #files = ['/Users/robert/7digit/digit00030.jpg']

    for file_name in files:
        image_name = file_name.split('/')[-1]
        image_name = image_name.split('.')[0]
        print( 'processing ', image_name)

        img = cv2.imread(file_name)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        cur_label = true_labels[image_name]

        seg_single_image(img, image_name, cur_label)

def chars_segment_from_file(img_file,sized_to=60):
    print( 'processing ', img_file)

    img = cv2.imread(img_file)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    return chars_segment(img,sized_to)


def chars_segment(img, sized_to=60):
    (row,col,ch)=img.shape

    img_gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    rate = 100.0/row
    img_gray = cv2.resize(img_gray, (0,0), fx=rate, fy=rate) 
    print img_gray.shape


    thresh = cv2.threshold(img_gray, 0, 255,
    cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

    (row,col)=thresh.shape
    total_nonezero = np.count_nonzero(thresh[30:60,:])
    k_size = 5
    edge_nonezero = np.count_nonzero(thresh[0:k_size,0:k_size])
    edge_nonezero += np.count_nonzero(thresh[0:k_size,col-k_size:col])
    edge_nonezero += np.count_nonzero(thresh[row-k_size:row,0:k_size])
    edge_nonezero += np.count_nonzero(thresh[row-k_size:row,col-k_size:col])

    if total_nonezero > (30*col)/3 and edge_nonezero > (k_size*k_size*4)*0.55 :
        thresh = cv2.threshold(img_gray, 0, 255,
            cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    dot_boxes = find_dot_boxes(thresh)  


    last_x = 0
    all_digits = []
    for (dx,dy,dw,dh) in dot_boxes:
        thresh[dy-1:dy+dh+2,dx-1:dx + dw +2] = 0
        #print (dx,dy,dw,dh)
        roi = thresh[:, last_x:dx+dw//2]

        last_x = dx + dw//2
        #print last_x
        digits = seg_digits(roi)
        for digit in digits:
            small_img = resize_digit(digit,sized_to)
            all_digits.append({'dtype':'char','data':small_img})

        
        all_digits.append({'dtype':'dot','data':(dx,dy,dw,dh)}) 
        
    roi = thresh[:, last_x:col]

    #process the region after the last dot
    digits = seg_digits(roi)
    for digit in digits:
        small_img = resize_digit(digit,sized_to)
        all_digits.append({'dtype':'char','data':small_img}) 

    return all_digits
        


def seg_single_image(img, image_name, cur_label):
    all_digits = chars_segment(img)

    total_num = len(all_digits)

    if total_num != len(cur_label):
        print 'boxs error! image name: ' + image_name 
        print 'true label: ', cur_label, ' total boxes:', total_num
        cur_label = 'u'*total_num
        

    for i in range(total_num):
        y_true = cur_label[i]

        if all_digits[i]['dtype'] == 'char':
            save2file(all_digits[i]['data'],image_name,i,y_true)
        else :   
            print 'find dot. true label:',y_true
                


def sort_contours(cnts, method="left-to-right"):
    # initialize the reverse flag and sort index
    reverse = False
    i = 0

    # handle if we need to sort in reverse
    if method == "right-to-left" or method == "bottom-to-top":
        reverse = True

    # handle if we are sorting against the y-coordinate rather than
    # the x-coordinate of the bounding box
    if method == "top-to-bottom" or method == "bottom-to-top":
        i = 1

    # construct the list of bounding boxes and sort them from top to
    # bottom
    boundingBoxes = [cv2.boundingRect(c) for c in cnts]
    (cnts, boundingBoxes) = zip(*sorted(zip(cnts, boundingBoxes),
        key=lambda b:b[1][i], reverse=reverse))

    # return the list of sorted contours and bounding boxes
    return (cnts, boundingBoxes)


def find_dot_boxes(img):
    boxes = []
    
    kernel = np.ones((2,2),np.uint8)
    erosion = cv2.erode(img,kernel,iterations = 1)

    im2, digitCnts, hierarchy = cv2.findContours(erosion.copy(), cv2.RETR_EXTERNAL,
                                    cv2.CHAIN_APPROX_SIMPLE)
    
    (cnts, boundingBoxes) = sort_contours(digitCnts, method="left-to-right")
    
    max_char_pos = 0
    for (x,y,w,h) in boundingBoxes: 
        #print (x,y,w,h)
        
        if x > 35 and (x + w)> max_char_pos and y > 60 and abs(w-h) <= 6: # may be dot 
            print 'found dot'
            print x, y, w,h,abs(w-h)
            
            if len(boxes) >=1:
                last_box = boxes[-1]
                if abs(last_box[1] - y) <=3:
                    boxes[-1] = (last_box[0],last_box[1],last_box[2]*2,last_box[3])
                else:
                    boxes.append((x,y,w,h))
            else:
                boxes.append((x,y,w,h))
        else:
            if x + w > max_char_pos:
                max_char_pos = x + w

    return boxes

def resize_digit(img_digit,sized_to):
    d = np.zeros((60,60),np.uint8)
    #print img_digit.shape
    (col,row) = img_digit.shape
    rate = 40.0/col
    small = cv2.resize(img_digit, (0,0), fx=rate, fy=rate)
    (col,row) = small.shape
    #print small.shape
    d[5:5+col,10:10+row] = small 

    if sized_to != 60:
        d = cv2.resize(d, (sized_to,sized_to))

    return d

def save2file(img_digit,img_name,index, label):
    
    img_path = os.path.join(root_path, 'out', label) 
    if not os.path.exists(img_path):
            os.makedirs(img_path)
    
    file_name = img_name+'_'+str(index)+'.png'
    file_name = os.path.join(img_path, file_name)
    
    cv2.imwrite(file_name, img_digit)
    
    

#letsgodigital
def get_true_labels():
    gts = {}
    with open('data/gt.csv', 'rU') as gt_csv:
        reader = csv.reader(gt_csv,dialect='excel')
        #reader = csv.reader(open(self.file, 'rU'), dialect=csv.excel_tab)
        for row in reader:
            #print row
            gts[row[0]] = row[1]
    
    return gts

def seg_digits(img):
    kernel = np.ones((3,3),np.uint8)
    erosion = cv2.erode(img,kernel,iterations = 1)
    
    kernel = np.ones((9,3),np.uint8)
    dilate = cv2.dilate(erosion,kernel,iterations = 1)
    
    #img_show_hook("dilate-0", dilate)
    
    digits = []

    im2, digitCnts, hierarchy = cv2.findContours(dilate.copy(), cv2.RETR_EXTERNAL, 
                                    cv2.CHAIN_APPROX_SIMPLE)
    
    (cnts, boundingBoxes) = sort_contours(digitCnts, method="left-to-right")
    

    for (x,y,w,h) in boundingBoxes:
        #cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)
        # if the contour is sufficiently large, it must be a digit
        if w >= 6 and h >= 65:
            
            if w > h *0.8: #two digits connected
                print 'two digits connected'
                print x, y, w,h
                #img_show_hook("roi-0", img[y:y+h,x:x + w])
                (dx,dy,dw,dh) = (x,y,w/2,h) #type = 0 digit; type = 1 dot
                
                roi = img[dy:dy+dh,dx:dx + dw]
                digits.append(roi)
                
                roi = img[y:y+h,x+w/2:x+w]
                #img_show_hook("roi-2", roi)
                digits.append(img[y:y+h,x+w/2:x+w])

            else:
                
                digits.append(img[y:y+h,x:x + w])
                #cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)


    #img_show_hook("boxes", img)
    return digits




def seg_single_image2(img, image_name, cur_label):
    (row,col,ch)=img.shape

    img_gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    rate = 100.0/row
    img_gray = cv2.resize(img_gray, (0,0), fx=rate, fy=rate) 
    print img_gray.shape


    thresh = cv2.threshold(img_gray, 0, 255,
    cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

    (row,col)=thresh.shape
    total_nonezero = np.count_nonzero(thresh[30:60,:])
    k_size = 5
    edge_nonezero = np.count_nonzero(thresh[0:k_size,0:k_size])
    edge_nonezero += np.count_nonzero(thresh[0:k_size,col-k_size:col])
    edge_nonezero += np.count_nonzero(thresh[row-k_size:row,0:k_size])
    edge_nonezero += np.count_nonzero(thresh[row-k_size:row,col-k_size:col])

    
#     all_edge_zero = True #(thresh[0,0] == 255 and thresh[0:5,col-6:col-1] == 255 and thresh[row-1,0] == 255 
#                      #and thresh[row-1,col-1] == 255) 
#     print 'total:',row*col,' nonezero:',total_nonezero
#     print 'edge:',thresh[0,0],thresh[0,col-1],thresh[row-1,0],thresh[row-1,col-1]
    if total_nonezero > (30*col)/3 and edge_nonezero > (k_size*k_size*4)*0.55 :
        thresh = cv2.threshold(img_gray, 0, 255,
            cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    dot_boxes = find_dot_boxes(thresh)  


    last_x = 0
    #print(row,col)
    all_digits = []
    total_num = len(dot_boxes)
    x_list = [0]
    for (dx,dy,dw,dh) in dot_boxes:
        thresh[dy-1:dy+dh+2,dx-1:dx + dw +2] = 0
        #print (dx,dy,dw,dh)
        roi = thresh[:, last_x:dx+dw//2]

        last_x = dx + dw//2
        #print last_x
        digits = seg_digits(roi)
        total_num += len(digits)
        all_digits.append(digits)
        
    roi = thresh[:, last_x:col]

    digits = seg_digits(roi)
    total_num += len(digits)
    all_digits.append(digits)    
        
    #img_show_hook("after_dot_remove", thresh)


    if total_num != len(cur_label):
        print 'boxs error! image name: ' + image_name 
        print 'true label: ', cur_label, ' total boxes:', total_num
        cur_label = 'u'*total_num
        

    i = 0
    for digits in all_digits:
        #print 'i:',i
        for roi in digits:
            y_true = cur_label[i]
            i += 1
            if y_true == '.':
                print 'error to find peroid. true labels:' + y_true
                save2file(roi,image_name,i,'uknown')
            else :   
                print 'label:',y_true
                save2file(roi,image_name,i,y_true)
                
        if i < total_num and i < len(cur_label):
            #print 'dot:', cur_label[i]
            i += 1

if __name__ == '__main__':
    main()


