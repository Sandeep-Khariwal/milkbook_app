import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { pick, types } from '@react-native-documents/picker';
import { useSelector } from 'react-redux';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { BASE_URL } from '../../../token/tokenStorage';



const MilkRateChart = () => {

    const firm = useSelector((state: any) => state.firm.value);

    const [selectedFile, setSelectedFile] = React.useState<any>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isFetching, setIsFetching] = React.useState(false);
    const [rateChart, setRateChart] = React.useState<any>(null);
    const [isLoadingChart, setIsLoadingChart] = React.useState(false);



    const selectExcelFile = async () => {
        try {
            const [result] = await pick({
                type: [types.xlsx],
                mode: 'import',
                allowMultiSelection: false,
            });

            setSelectedFile(result);

            console.log('Selected Excel:', result);
        } catch (error) {
            console.log('Excel Picker Error:', error);
        }
    };

    const fetchRateChart = async () => {
        if (!firm?.id) {
            return;
        }

        setIsLoadingChart(true);

        try {
            const response = await fetch(
                `${BASE_URL}/milk-rate/active/${firm.id}`,
            );

            const data = await response.json();

            console.log('Milk Rate Chart:', data);

            if (!response.ok) {
                setRateChart(null);
                return;
            }

            setRateChart(data.chart);
        } catch (error) {
            console.log('Fetch Milk Rate Chart Error:', error);
            setRateChart(null);
        } finally {
            setIsLoadingChart(false);
        }
    };

    React.useEffect(() => {
        fetchRateChart();
    }, [firm?.id]);

    const renderChartSkeleton = () => {
    return (
        <View style={styles.chartSkeleton}>

            {/* Chart Header Skeleton */}
            <View style={styles.skeletonHeaderRow}>
                <View style={styles.skeletonIcon} />

                <View style={styles.skeletonHeaderContent}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonSubtitle} />
                </View>

                <View style={styles.skeletonRefresh} />
            </View>

            {/* Status Skeleton */}
            <View style={styles.skeletonStatusRow}>
                <View style={styles.skeletonStatusItem} />
                <View style={styles.skeletonDivider} />
                <View style={styles.skeletonStatusItem} />
                <View style={styles.skeletonDivider} />
                <View style={styles.skeletonStatusItem} />
            </View>

            {/* Matrix Title Skeleton */}
            <View style={styles.skeletonMatrixHeader}>
                <View>
                    <View style={styles.skeletonMatrixTitle} />
                    <View style={styles.skeletonMatrixSubtitle} />
                </View>

                <View style={styles.skeletonBadge} />
            </View>

            {/* Table Skeleton */}
            <View style={styles.skeletonTable}>

                <View style={styles.skeletonTableHeader}>
                    <View style={styles.skeletonFatHeader} />

                    <View style={styles.skeletonHeaderCell} />
                    <View style={styles.skeletonHeaderCell} />
                    <View style={styles.skeletonHeaderCell} />
                    <View style={styles.skeletonHeaderCell} />
                </View>

                {[1, 2, 3, 4, 5].map(item => (
                    <View
                        key={item}
                        style={styles.skeletonTableRow}
                    >
                        <View style={styles.skeletonFatCell} />
                        <View style={styles.skeletonRateCell} />
                        <View style={styles.skeletonRateCell} />
                        <View style={styles.skeletonRateCell} />
                        <View style={styles.skeletonRateCell} />
                    </View>
                ))}

            </View>

        </View>
    );
};

const renderRateTable = () => {
    if (!rateChart?.rates?.length) {
        return null;
    }

    const snfValues = rateChart.rates[0]?.rates || [];

    return (
        <View style={styles.chartSection}>

            {/* Chart Top Header */}
            <View style={styles.chartTopHeader}>

                <View style={styles.chartTitleRow}>
                   
                    <View style={styles.chartTitleIcon}>
                        <Icon
                            name="bar-chart"
                            size={24}
                            color="#ffffff"
                        />
                    </View>

                    <View style={styles.chartTitleContent}>
                        <Text style={styles.chartMainTitle}>
                            Milk Rate Chart
                        </Text>

                        
                    </View>

                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={fetchRateChart}
                        disabled={isLoadingChart}
                    >
                        <Icon
                            name="refresh"
                            size={22}
                            color="#5086E7"
                        />
                    </TouchableOpacity>
                </View>

            </View>

            {/* Chart Status */}
            <View style={styles.chartStatusRow}>

                <View style={styles.statusItem}>
                    <View style={styles.activeStatusDot} />

                    <Text style={styles.statusGreenText}>
                        Active Chart
                    </Text>
                </View>

                <View style={styles.statusDivider} />

                <View style={styles.statusItem}>
                    <Icon
                        name="document-text-outline"
                        size={20}
                        color="#64748b"
                    />

                    <Text style={styles.statusText}>
                        Version {rateChart.version}
                    </Text>
                </View>

                <View style={styles.statusDivider} />

                <View style={styles.statusItem}>
                    <Icon
                        name="calendar-outline"
                        size={19}
                        color="#64748b"
                    />

                    <Text style={styles.statusText}>
                        {rateChart.uploadedAt
                            ? new Date(
                                rateChart.uploadedAt,
                            ).toLocaleDateString()
                            : 'Recently uploaded'}
                    </Text>
                </View>

            </View>

            {/* Matrix Header */}
            <View style={styles.matrixHeader}>

                <View>
                    <View style={styles.matrixTitleRow}>
                        <Icon
                            name="bar-chart"
                            size={20}
                            color="#5086E7"
                        />

                        <Text style={styles.matrixTitle}>
                            Rate Matrix (₹ / Kg)
                        </Text>
                    </View>

                    <Text style={styles.matrixSubtitle}>
                        Rate based on Fat % and SNF %
                    </Text>
                </View>

                <View style={styles.rateUnitBadge}>
                    <Icon
                        name="cash-outline"
                        size={16}
                        color="#5086E7"
                    />

                    <Text style={styles.rateUnitText}>
                        ₹ / Kg
                    </Text>
                </View>

            </View>

            {/* Horizontal Table */}
            <View style={styles.rateTableContainer}>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    <View>

                        {/* TABLE HEADER */}
                        <View style={styles.rateTableRow}>

                            <View
                                style={[
                                    styles.rateTableCell,
                                    styles.fatHeaderCell,
                                ]}
                            >
                                <Text style={styles.fatHeaderText}>
                                    FAT ↓
                                </Text>

                                <Text style={styles.snfHeaderText}>
                                    SNF →
                                </Text>
                            </View>

                            {snfValues.map(
                                (item: any, index: number) => (
                                    <View
                                        key={`snf-header-${index}`}
                                        style={[
                                            styles.rateTableCell,
                                            styles.snfHeaderCell,
                                        ]}
                                    >
                                        <Text
                                            style={styles.snfValueText}
                                        >
                                            {Number(item.snf).toFixed(1)}
                                        </Text>
                                    </View>
                                ),
                            )}

                        </View>

                        {/* TABLE BODY */}
                        {rateChart.rates.map(
                            (fatRow: any, rowIndex: number) => (
                                <View
                                    key={`fat-row-${rowIndex}`}
                                    style={[
                                        styles.rateTableRow,
                                        rowIndex % 2 === 0 &&
                                            styles.rateAlternateRow,
                                    ]}
                                >

                                    {/* FAT */}
                                    <View
                                        style={[
                                            styles.rateTableCell,
                                            styles.fatValueCell,
                                        ]}
                                    >
                                        <Text
                                            style={
                                                styles.fatValueText
                                            }
                                        >
                                            {Number(
                                                fatRow.fat,
                                            ).toFixed(1)}
                                        </Text>
                                    </View>

                                    {/* RATES */}
                                    {fatRow.rates.map(
                                        (
                                            rateItem: any,
                                            rateIndex: number,
                                        ) => (
                                            <View
                                                key={`rate-${rowIndex}-${rateIndex}`}
                                                style={
                                                    styles.rateTableCell
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.rateValueText
                                                    }
                                                >
                                                    {Number(
                                                        rateItem.rate,
                                                    ).toFixed(2)}
                                                </Text>
                                            </View>
                                        ),
                                    )}

                                </View>
                            ),
                        )}

                    </View>
                </ScrollView>

            </View>

            {/* Swipe Hint */}
            <View style={styles.swipeHint}>

                <Icon
                    name="swap-horizontal-outline"
                    size={19}
                    color="#5086E7"
                />

                <Text style={styles.swipeHintText}>
                    Swipe horizontally to view more SNF rates
                </Text>

            </View>

            {/* How It Works */}
            <View style={styles.howItWorks}>

                <View style={styles.howItWorksIcon}>
                    <Icon
                        name="clipboard-outline"
                        size={25}
                        color="#5086E7"
                    />
                </View>

                <View style={styles.howItWorksContent}>

                    <Text style={styles.howItWorksTitle}>
                        How it works?
                    </Text>

                    <Text style={styles.howItWorksText}>
                        Find your milk rate by matching your
                        Fat % with the row and SNF % with the
                        column from the chart.
                    </Text>

                </View>

            </View>

        </View>
    );
};

    const uploadExcelFile = async () => {
        if (!selectedFile) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Warning',
                textBody: 'Please select an Excel file first',
            });
            return;
        }

        if (!firm?.id) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Firm ID not found',
            });
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();

            formData.append('file', {
                uri: selectedFile.uri,
                type:
                    selectedFile.type ||
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                name: selectedFile.name || 'milk-rate-chart.xlsx',
            } as any);

            formData.append('firmId', firm.id);

            const response = await fetch(
                `${BASE_URL}/milk-rate/upload`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            const data = await response.json();

            console.log('Milk Rate Upload Response:', data);

            if (!response.ok) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Upload Failed',
                    textBody: data.message || 'Milk rate chart upload failed',
                });
                return;
            }

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'Milk rate chart uploaded successfully',
            });

            setSelectedFile(null);
            await fetchRateChart();
        } catch (error) {
            console.log('Milk Rate Upload Error:', error);

            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Something went wrong while uploading',
            });
        } finally {
            setIsUploading(false);
        }
    };

return (
    <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
    >
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Icon
                        name="document-text-outline"
                        size={28}
                        color="#5086E7"
                    />
                </View>

                <Text style={styles.title}>Milk Rate Chart</Text>

                <Text style={styles.description}>
                    Upload the latest Fat × SNF rate chart for your firm.
                </Text>

                <TouchableOpacity
                    style={styles.selectButton}
                    onPress={selectExcelFile}
                >
                    <Icon name="document-outline" size={20} color="#5086E7" />

                    <Text style={styles.selectButtonText}>
                        {selectedFile ? 'Change Excel File' : 'Select Excel File'}
                    </Text>
                </TouchableOpacity>

                {selectedFile && (
                    <View style={styles.fileBox}>
                        <Icon
                            name="document-text-outline"
                            size={22}
                            color="#16a34a"
                        />

                        <View style={styles.fileInfo}>
                            <Text style={styles.fileName} numberOfLines={1}>
                                {selectedFile.name}
                            </Text>

                            <Text style={styles.fileStatus}>
                                Excel file selected
                            </Text>
                        </View>
                    </View>
                )}
                {selectedFile && (
                    <TouchableOpacity
                        style={[
                            styles.uploadButton,
                            isUploading && styles.uploadButtonDisabled,
                        ]}
                        onPress={uploadExcelFile}
                        disabled={isUploading}
                    >
                        <Icon
                            name="cloud-upload-outline"
                            size={20}
                            color="#fff"
                        />

                        <Text style={styles.uploadButtonText}>
                            {isUploading
                                ? 'Uploading...'
                                : 'Upload & Save Rate Chart'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

<View style={styles.chartSection}>
    {isLoadingChart ? (
        renderChartSkeleton()
    ) : rateChart ? (
        renderRateTable()
    ) : (
        <Text style={styles.emptyText}>
            No milk rate chart uploaded yet.
        </Text>
    )}
</View>
    </ScrollView>
);
};

export default MilkRateChart;

const styles = StyleSheet.create({
    // =========================
    // MAIN SCREEN
    // =========================

  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 12,
},

    contentContainer: {
        paddingBottom: 30,
    },

    // =========================
    // UPLOAD CARD
    // SAME AS BEFORE
    // =========================

    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 22,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 15,
        backgroundColor: '#eef4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#172033',
        marginBottom: 7,
    },

    description: {
        fontSize: 14,
        lineHeight: 21,
        color: '#64748b',
        marginBottom: 22,
    },

    selectButton: {
        height: 52,
        borderWidth: 1.5,
        borderColor: '#5086E7',
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
    },

    selectButtonText: {
        color: '#5086E7',
        fontSize: 15,
        fontWeight: '700',
    },

    // =========================
    // SELECTED FILE
    // SAME AS BEFORE
    // =========================

    fileBox: {
        marginTop: 14,
        padding: 14,
        borderRadius: 13,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
    },

    fileInfo: {
        flex: 1,
        marginLeft: 11,
    },

    fileName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
    },

    fileStatus: {
        fontSize: 12,
        color: '#16a34a',
        marginTop: 4,
        fontWeight: '600',
    },

    // =========================
    // UPLOAD BUTTON
    // SAME AS BEFORE
    // =========================

    uploadButton: {
        height: 52,
        marginTop: 12,
        borderRadius: 13,
        backgroundColor: '#5086E7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    uploadButtonDisabled: {
        opacity: 0.6,
    },

    uploadButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },

    // =====================================================
    // PROFESSIONAL RATE CHART
    // =====================================================

    chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
        width: 0,
        height: 4,
    },
},

chartTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 14,
},

    chartBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
},

   chartSection: {
    marginTop: 15,
    width: '100%',
},

    // =========================
    // CHART TOP HEADER
    // =========================

    chartTopHeader: {
        paddingHorizontal: 2,
        marginBottom: 14,
    },

    chartTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    chartTitleIcon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: '#5086E7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    chartTitleContent: {
        flex: 1,
    },

    chartMainTitle: {
        fontSize: 21,
        fontWeight: '800',
        color: '#172033',
    },

    chartMainSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },

    refreshButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#dbe3ef',
    },

    // =========================
    // CHART STATUS
    // =========================

    chartStatusRow: {
        minHeight: 48,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

    statusItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    activeStatusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#16a34a',
        marginRight: 6,
    },

    statusGreenText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803d',
    },

    statusText: {
        marginLeft: 5,
        fontSize: 10,
        fontWeight: '600',
        color: '#64748b',
    },

    statusDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#e2e8f0',
    },

    // =========================
    // MATRIX HEADER
    // =========================

    matrixHeader: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    matrixTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    matrixTitle: {
        marginLeft: 7,
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },

    matrixSubtitle: {
        marginTop: 4,
        marginLeft: 27,
        fontSize: 11,
        color: '#64748b',
    },

    rateUnitBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: '#eef4ff',
    },

    rateUnitText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#5086E7',
    },

    // =========================
    // RATE TABLE
    // =========================

rateTableContainer: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
},

    rateTableRow: {
        flexDirection: 'row',
    },

rateTableCell: {
    width: 74,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8edf3',
    backgroundColor: '#ffffff',
},

    // =========================
    // TABLE HEADER
    // =========================

fatHeaderCell: {
    width: 70,
    backgroundColor: '#5086E7',
},

snfHeaderCell: {
    backgroundColor: '#5086E7',
},

    fatHeaderText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#ffffff',
    },

    snfHeaderText: {
        marginTop: 2,
        fontSize: 9,
        color: '#dbeafe',
        fontWeight: '600',
    },

    snfValueText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#ffffff',
    },

    // =========================
    // TABLE BODY
    // =========================

    fatValueCell: {
        width: 70,
        backgroundColor: '#eef4ff',
    },

    fatValueText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2458a6',
    },

    rateValueText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },

    rateAlternateRow: {
        backgroundColor: '#f8fbff',
    },

    // =========================
    // SWIPE HINT
    // =========================

    swipeHint: {
        height: 40,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },

    swipeHintText: {
        marginLeft: 6,
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },

    // =========================
    // HOW IT WORKS
    // =========================

    howItWorks: {
        marginTop: 14,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
    },

    howItWorksIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#eef4ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    howItWorksContent: {
        flex: 1,
    },

    howItWorksTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 3,
    },

    howItWorksText: {
        fontSize: 11,
        lineHeight: 17,
        color: '#64748b',
    },

    // =========================
    // STATES
    // =========================

    loadingText: {
        fontSize: 14,
        color: '#64748b',
        paddingVertical: 20,
    },

    emptyText: {
        fontSize: 14,
        color: '#64748b',
        paddingVertical: 20,
    },


    // =========================
// CHART SKELETON
// =========================

chartSkeleton: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingVertical: 4,
},

skeletonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
},

skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#e8edf5',
    marginRight: 11,
},

skeletonHeaderContent: {
    flex: 1,
},

skeletonTitle: {
    width: 145,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#e8edf5',
    marginBottom: 8,
},

skeletonSubtitle: {
    width: 105,
    height: 11,
    borderRadius: 5,
    backgroundColor: '#eef2f7',
},

skeletonRefresh: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#eef2f7',
},

skeletonStatusRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
},

skeletonStatusItem: {
    flex: 1,
    height: 13,
    borderRadius: 6,
    backgroundColor: '#e9eef5',
    marginHorizontal: 7,
},

skeletonDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#edf0f4',
},

skeletonMatrixHeader: {
    minHeight: 64,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f4',
},

skeletonMatrixTitle: {
    width: 155,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#e8edf5',
    marginBottom: 8,
},

skeletonMatrixSubtitle: {
    width: 135,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eef2f7',
},

skeletonBadge: {
    width: 65,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#eef2f7',
},

skeletonTable: {
    marginTop: 12,
    overflow: 'hidden',
},

skeletonTableHeader: {
    height: 49,
    flexDirection: 'row',
    backgroundColor: '#e7edf5',
},

skeletonFatHeader: {
    width: 70,
    height: 49,
    backgroundColor: '#dce5f1',
},

skeletonHeaderCell: {
    width: 74,
    height: 49,
    marginLeft: 1,
    backgroundColor: '#e7edf5',
},

skeletonTableRow: {
    height: 49,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f4',
},

skeletonFatCell: {
    width: 70,
    height: 49,
    backgroundColor: '#f0f4f9',
},

skeletonRateCell: {
    width: 74,
    height: 49,
    marginLeft: 1,
    backgroundColor: '#f7f9fb',
},

refreshButtonDisabled: {
    opacity: 0.5,
},
});