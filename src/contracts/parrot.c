#include <memory.h>
#include "ckb_syscalls.h"

int main(int argc, char* argv[]){
    int ret;
    size_t index = 0;
    uint64_t len = 0;
    unsigned char buffer[6];

    while(1){
        len = 6;
        memset(buffer, 0, 6);
        ret = ckb_load_cell_data(buffer, &len, 0, index, CKB_SOURCE_OUTPUT);
        if (ret == CKB_INDEX_OUT_OF_BOUND) {
            break;
        }

        if (memcmp(buffer, "parrot", 6) == 0) {
            return -1;
        }

        index++;
    }
    return 0;
}