import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getCinemas, getSchedules, getOccupiedSeats, createBooking } from '../api';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '../types/navigation';
import type { Cinema, Movie, Schedule } from '../types/api';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from '../theme';

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const SEATS_PER_ROW = 14;

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

type SelectedState = {
  cinema: string | null;
  cinemaId: number | null;
  date: null | string;
  time: null | string;
  seats: string[];
  price: number;
  paymentMethod: null | string;
  paymentNumber: string;
};

export default function BookingScreen({ route, navigation }: Props) {
  const { movie } = route.params as { movie: Movie };
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SelectedState>({
    cinema: null,
    cinemaId: null,
    date: null,
    time: null,
    seats: [],
    price: 350,
    paymentMethod: null,
    paymentNumber: '',
  });
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cinemasRes, schedulesRes] = await Promise.all([getCinemas(), getSchedules()]);
      setCinemas(Array.isArray(cinemasRes.data) ? (cinemasRes.data as Cinema[]) : []);
      setSchedules(Array.isArray(schedulesRes.data) ? (schedulesRes.data as Schedule[]) : []);
    } catch {
      showToast('Failed to load booking data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableCinemas = useMemo(() => {
    return cinemas.filter((c) => schedules.some((s) => s.movie_id == movie.id && s.cinema_id == c.id));
  }, [cinemas, schedules, movie.id]);

  const scheduleForCinema = useMemo(() => {
    if (!selected.cinemaId) return [];
    return schedules.filter((s) => s.movie_id == movie.id && s.cinema_id == selected.cinemaId);
  }, [schedules, selected.cinemaId, movie.id]);

  const dates = useMemo(() => {
    const unique = new Set(scheduleForCinema.map((s) => s.date));
    return Array.from(unique).sort();
  }, [scheduleForCinema]);

  const showtimes = useMemo(() => {
    if (!selected.date) return [] as string[];
    const s = scheduleForCinema.find((x) => x.date === selected.date);
    if (!s) return [];
    let times = s.show_times;
    if (typeof times === 'string') {
      try {
        times = JSON.parse(times) as string[];
      } catch {
        times = [];
      }
    }
    return Array.isArray(times) ? times : [];
  }, [selected.date, scheduleForCinema]);

  const totalPrice = selected.seats.length * (selected.price || 350);

  const loadOccupied = async () => {
    if (!selected.cinema || !selected.date || !selected.time) return;
    setLoadingSeats(true);
    try {
      const res = await getOccupiedSeats(movie.id, selected.cinema, selected.date, selected.time);
      setOccupiedSeats(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast('Failed to load seat availability', 'error');
      setOccupiedSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    if (step === 3) {
      loadOccupied();
    }
  }, [step, selected.cinema, selected.date, selected.time]);

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    setSelected((prev) => ({
      ...prev,
      seats: prev.seats.includes(seatId) ? prev.seats.filter((s) => s !== seatId) : [...prev.seats, seatId],
    }));
  };

  const handleConfirm = async () => {
    if (!selected.cinemaId || !selected.cinema || !selected.date || !selected.time) {
      showToast('Please complete all selections', 'error');
      return;
    }
    if (selected.seats.length === 0) {
      showToast('Please select at least one seat', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({
        movie_id: movie.id,
        cinema_id: selected.cinemaId,
        branch: selected.cinema,
        date: selected.date,
        time: selected.time,
        seats: [...selected.seats].sort(),
        total_price: totalPrice,
        payment_method: selected.paymentMethod || 'GCash',
      });

      if (res.ok && res.data?.success && res.data.tx_number) {
        showToast('Booking confirmed!', 'success');
        setStep(5);
      } else {
        showToast(res.data?.message || 'Booking failed. Please try again.', 'error');
      }
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && step === 1) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading booking options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay */}
      <Modal visible={submitting} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.overlayText}>Processing your booking...</Text>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.back} onPress={() => (step > 1 ? setStep((step - 1) as 1 | 2 | 3 | 4 | 5) : navigation.goBack())}>
          <View style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.movieTitle}>{movie.title}</Text>
          {selected.cinema && (
            <Text style={styles.sub}>
              {selected.cinema} | {selected.date} | {selected.time}
            </Text>
          )}
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View key={s} style={styles.progressItem}>
              <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
                {step > s ? (
                  <Text style={styles.progressCheck}>✓</Text>
                ) : (
                  <Text style={[styles.progressNum, step >= s && styles.progressNumActive]}>{s}</Text>
                )}
              </View>
              {s < 5 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
            </View>
          ))}
        </View>

        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Cinema</Text>
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Date/Time</Text>
          <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Seats</Text>
          <Text style={[styles.stepLabel, step >= 4 && styles.stepLabelActive]}>Payment</Text>
          <Text style={[styles.stepLabel, step >= 5 && styles.stepLabelActive]}>Done</Text>
        </View>

        {step === 1 ? (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Select Cinema</Text>
            {availableCinemas.length === 0 ? (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}></Text>
                <Text style={styles.emptyText}>No cinemas available for this movie</Text>
              </View>
            ) : (
              availableCinemas.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.cinemaCard,
                    selected.cinemaId === c.id && styles.cinemaCardActive
                  ]}
                  onPress={() => {
                    setSelected((prev) => ({ ...prev, cinema: c.name, cinemaId: c.id, date: null, time: null, seats: [] }));
                    setStep(2);
                  }}
                >
                  {selected.cinemaId === c.id && (
                    <LinearGradient
                      colors={GRADIENTS.primary as any}
                      style={styles.cinemaCardGradient}
                    />
                  )}
                  <View style={styles.cinemaContent}>
                    <Text style={styles.cinemaName}>{c.name}</Text>
                    <Text style={styles.cinemaLoc}>{c.location}</Text>
                  </View>
                  {selected.cinemaId === c.id && (
                    <View style={styles.cinemaCheck}>
                      <Text style={styles.cinemaCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.dateBtn,
                    selected.date === d && styles.dateBtnActive
                  ]}
                  onPress={() => setSelected((prev) => ({ ...prev, date: d, time: null, seats: [] }))}
                >
                  {selected.date === d && (
                    <LinearGradient
                      colors={GRADIENTS.primary as any}
                      style={styles.dateBtnGradient}
                    />
                  )}
                  <Text style={[
                    styles.dateText,
                    selected.date === d && styles.dateTextActive
                  ]}>
                    {new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[
                    styles.dateNum,
                    selected.date === d && styles.dateNumActive
                  ]}>
                    {new Date(d).getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selected.date && (
              <>
                <Text style={styles.stepTitle}>Select Time</Text>
                <View style={styles.timeGrid}>
                  {showtimes.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.timeBtn,
                        selected.time === t && styles.timeBtnActive
                      ]}
                      onPress={() => {
                        const s = scheduleForCinema.find((x) => x.date === selected.date);
                        setSelected((prev) => ({ ...prev, time: t, price: Number(s?.price ?? 350), seats: [] }));
                        setStep(3);
                      }}
                    >
                      {selected.time === t && (
                        <LinearGradient
                          colors={GRADIENTS.primary as any}
                          style={styles.timeBtnGradient}
                        />
                      )}
                      <Text style={[
                        styles.timeText,
                        selected.time === t && styles.timeTextActive
                      ]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Select Your Seats</Text>
            <Text style={styles.stepSubtitle}>Tap on available seats to select</Text>
            
            {loadingSeats ? (
              <View style={styles.centered}>
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 40 }} />
                <Text style={styles.loadingText}>Loading seats...</Text>
              </View>
            ) : (
              <>
                <View style={styles.screenContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.screenBar}
                  />
                  <Text style={styles.screenLabel}>SCREEN</Text>
                </View>

                {SEAT_ROWS.map((row) => (
                  <View key={row} style={styles.seatRow}>
                    <Text style={styles.rowLabel}>{row}</Text>
                    {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                      const num = i + 1;
                      const seatId = `${row}${num}`;
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isAisle = num === 4 || num === 11;
                      const isSelected = selected.seats.includes(seatId);
                      if (isAisle) return <View key={seatId} style={styles.aisle} />;
                      return (
                        <TouchableOpacity
                          key={seatId}
                          style={[
                            styles.seat,
                            isOccupied && styles.seatOccupied,
                            isSelected && styles.seatSelected
                          ]}
                          onPress={() => toggleSeat(seatId)}
                          disabled={isOccupied}
                        >
                          {isSelected && (
                            <LinearGradient
                              colors={GRADIENTS.gold as any}
                              style={styles.seatSelectedGradient}
                            />
                          )}
                          <Text style={[
                            styles.seatText,
                            isOccupied && styles.seatTextOccupied,
                            isSelected && styles.seatTextSelected
                          ]}>
                            {num}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <Text style={styles.rowLabel}>{row}</Text>
                  </View>
                ))}

                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendSeat, styles.seatAvailable]} />
                    <Text style={styles.legendText}>Available</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendSeat, styles.seatSelectedLegend]} />
                    <Text style={styles.legendText}>Selected</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendSeat, styles.seatOccupiedLegend]} />
                    <Text style={styles.legendText}>Occupied</Text>
                  </View>
                </View>

                <View style={styles.seatSummary}>
                  <View style={styles.seatSummaryLeft}>
                    <Text style={styles.seatSummaryLabel}>Selected Seats</Text>
                    <Text style={styles.seatSummaryValue}>
                      {selected.seats.slice().sort().join(', ') || 'None selected'}
                    </Text>
                  </View>
                  <View style={styles.seatSummaryRight}>
                    <Text style={styles.seatSummaryLabel}>Total</Text>
                    <Text style={styles.seatSummaryPrice}>Php{totalPrice.toFixed(2)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.nextBtn,
                    selected.seats.length === 0 && styles.nextBtnDisabled
                  ]}
                  onPress={() => setStep(4)}
                  disabled={selected.seats.length === 0}
                >
                  <LinearGradient
                    colors={selected.seats.length > 0 ? GRADIENTS.primary : ['#444', '#333'] as any}
                    style={styles.nextBtnGradient}
                  >
                    <Text style={styles.nextBtnText}>Continue to Payment</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}

        {step === 4 ? (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Review & Pay</Text>

            <View style={styles.summaryCard}>
              <LinearGradient
                colors={GRADIENTS.primary as any}
                style={styles.summaryHeader}
              >
                <Text style={styles.summaryTitle}>Booking Summary</Text>
              </LinearGradient>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Movie</Text>
                  <Text style={styles.summaryValue}>{movie.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Cinema</Text>
                  <Text style={styles.summaryValue}>{selected.cinema}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date</Text>
                  <Text style={styles.summaryValue}>{selected.date}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time</Text>
                  <Text style={styles.summaryValue}>{selected.time}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Seats</Text>
                  <Text style={styles.summaryValue}>{selected.seats.slice().sort().join(', ')}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>Php{totalPrice.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.stepTitle}>Select Payment Method</Text>
            
            <View style={styles.paymentOptions}>
              {['GCash', 'PayMaya', 'Credit Card'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentBtn,
                    selected.paymentMethod === method && styles.paymentBtnActive
                  ]}
                  onPress={() => setSelected((prev) => ({ ...prev, paymentMethod: method, paymentNumber: '' }))}
                >
                  {selected.paymentMethod === method && (
                    <LinearGradient
                      colors={GRADIENTS.primary as any}
                      style={styles.paymentBtnGradient}
                    />
                  )}
                  <Text style={styles.paymentIcon}></Text>
                  <Text style={[
                    styles.paymentName,
                    selected.paymentMethod === method && styles.paymentNameActive
                  ]}>
                    {method}
                  </Text>
                  {selected.paymentMethod === method && (
                    <View style={styles.paymentCheck}>
                      <Text style={styles.paymentCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selected.paymentMethod && (
              <View style={styles.paymentInputContainer}>
                <Text style={styles.paymentInputLabel}>
                  {selected.paymentMethod === 'Credit Card' ? 'Card Number' : `${selected.paymentMethod} Number`}
                </Text>
                <TextInput
                  style={styles.paymentInput}
                  placeholder="Enter number"
                  placeholderTextColor={COLORS.textMuted}
                  value={selected.paymentNumber}
                  onChangeText={(text) => setSelected((prev) => ({ ...prev, paymentNumber: text }))}
                  keyboardType="numeric"
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (!selected.paymentMethod || selected.paymentNumber.length < 5) && styles.confirmBtnDisabled
              ]}
              onPress={handleConfirm}
              disabled={!selected.paymentMethod || selected.paymentNumber.length < 5 || submitting}
            >
              <LinearGradient
                colors={selected.paymentMethod && selected.paymentNumber.length >= 5 ? GRADIENTS.primary : ['#444', '#333'] as any}
                style={styles.confirmBtnGradient}
              >
                <Text style={styles.confirmText}>Confirm Booking - Php{totalPrice.toFixed(2)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 5 ? (
          <View style={styles.step}>
            <View style={styles.successContainer}>
              <LinearGradient
                colors={GRADIENTS.success as any}
                style={styles.successIcon}
              >
                <Text style={styles.successEmoji}>✓</Text>
              </LinearGradient>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSubtitle}>Your e-ticket is ready</Text>
            </View>

            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketMovie}>{movie.title}</Text>
                <Text style={styles.ticketCinema}>{selected.cinema}</Text>
              </View>
              <View style={styles.ticketDetails}>
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailIcon}></Text>
                  <Text style={styles.ticketDetailLabel}>Date:</Text>
                  <Text style={styles.ticketDetailValue}>{selected.date}</Text>
                </View>
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailIcon}></Text>
                  <Text style={styles.ticketDetailLabel}>Time:</Text>
                  <Text style={styles.ticketDetailValue}>{selected.time}</Text>
                </View>
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailIcon}></Text>
                  <Text style={styles.ticketDetailLabel}>Seats:</Text>
                  <Text style={styles.ticketDetailValue}>{selected.seats.slice().sort().join(', ')}</Text>
                </View>
              </View>
              <View style={styles.ticketTotal}>
                <Text style={styles.ticketTotalLabel}>Total Paid</Text>
                <Text style={styles.ticketTotalValue}>Php{totalPrice.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.doneBtn}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={GRADIENTS.primary as any}
                style={styles.doneBtnGradient}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { paddingBottom: 40 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { alignItems: 'center' },
  loadingIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, ...SHADOWS.glow },
  loadingEmoji: { fontSize: 36 },
  loadingText: { color: COLORS.textMuted, fontSize: 14, marginTop: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  overlayContent: { backgroundColor: COLORS.surface, padding: 32, borderRadius: SIZES.radiusLarge, alignItems: 'center', ...SHADOWS.large },
  overlayIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  overlayEmoji: { fontSize: 28 },
  overlayText: { color: COLORS.text, fontSize: 16, marginTop: 16, fontWeight: '600' },
  back: { padding: 16, paddingTop: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  backText: { color: COLORS.text, fontSize: 20, fontWeight: '600' },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  movieTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sub: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8, paddingHorizontal: 20 },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.surfaceLighter },
  progressDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  progressCheck: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  progressNum: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  progressNumActive: { color: COLORS.text },
  progressLine: { width: 30, height: 2, backgroundColor: COLORS.surfaceLighter, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: COLORS.primary },
  stepLabels: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, paddingHorizontal: 10 },
  stepLabel: { fontSize: 9, color: COLORS.textMuted, marginHorizontal: 2, textAlign: 'center' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '600' },
  step: { paddingHorizontal: 20 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  stepSubtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: -12, marginBottom: 16 },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
  cinemaCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: SIZES.radius, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', ...SHADOWS.small },
  cinemaCardActive: { borderColor: COLORS.primary },
  cinemaCardGradient: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: 2 },
  cinemaContent: { flex: 1 },
  cinemaName: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cinemaLoc: { color: COLORS.textMuted, fontSize: 13 },
  cinemaCheck: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  cinemaCheckText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  dateScroll: { marginBottom: 20 },
  dateBtn: { width: 64, padding: 12, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, marginRight: 10, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', ...SHADOWS.small },
  dateBtnActive: { borderColor: COLORS.primary },
  dateBtnGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: SIZES.radius - 2 },
  dateText: { color: COLORS.textMuted, fontSize: 11, marginBottom: 4 },
  dateTextActive: { color: COLORS.text },
  dateNum: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '700' },
  dateNumActive: { color: COLORS.text },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeBtn: { paddingVertical: 14, paddingHorizontal: 28, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, borderWidth: 2, borderColor: 'transparent', position: 'relative', overflow: 'hidden', ...SHADOWS.small },
  timeBtnActive: { borderColor: COLORS.primary },
  timeBtnGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  timeText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15, zIndex: 1 },
  timeTextActive: { color: COLORS.text },
  screenContainer: { alignItems: 'center', marginBottom: 24 },
  screenBar: { height: 6, borderRadius: 3, width: '70%', marginBottom: 8 },
  screenLabel: { textAlign: 'center', color: COLORS.textMuted, fontSize: 10, letterSpacing: 2, fontWeight: '600' },
  seatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  rowLabel: { width: 20, color: COLORS.textMuted, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  seat: { width: 26, height: 26, backgroundColor: COLORS.green, borderRadius: 6, margin: 2, justifyContent: 'center', alignItems: 'center', position: 'relative', ...SHADOWS.small },
  seatOccupied: { backgroundColor: COLORS.surfaceLighter },
  seatSelected: { backgroundColor: COLORS.gold },
  seatSelectedGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 6 },
  seatText: { color: COLORS.text, fontSize: 9, fontWeight: '700', zIndex: 1 },
  seatTextOccupied: { color: COLORS.textMuted },
  seatTextSelected: { color: '#000' },
  aisle: { width: 10 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 24, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSeat: { width: 18, height: 18, borderRadius: 4 },
  seatAvailable: { backgroundColor: COLORS.green },
  seatOccupiedLegend: { backgroundColor: COLORS.surfaceLighter },
  seatSelectedLegend: { backgroundColor: COLORS.gold },
  legendText: { color: COLORS.textMuted, fontSize: 12 },
  seatSummary: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, padding: 16, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, ...SHADOWS.small },
  seatSummaryLeft: { flex: 1 },
  seatSummaryRight: { alignItems: 'flex-end' },
  seatSummaryLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  seatSummaryValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  seatSummaryPrice: { color: COLORS.primary, fontSize: 20, fontWeight: '800' },
  nextBtn: { marginTop: 20, borderRadius: SIZES.radius, overflow: 'hidden' },
  nextBtnDisabled: {},
  nextBtnGradient: { padding: 16, alignItems: 'center' },
  nextBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLarge, marginBottom: 20, overflow: 'hidden', ...SHADOWS.medium },
  summaryHeader: { padding: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  summaryContent: { padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: COLORS.textMuted, fontSize: 14 },
  summaryValue: { color: COLORS.text, fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  totalLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  totalValue: { color: COLORS.primary, fontSize: 24, fontWeight: '800' },
  summaryDivider: { height: 1, backgroundColor: COLORS.surfaceLighter, marginVertical: 12 },
  paymentOptions: { gap: 12 },
  paymentBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: SIZES.radius, borderWidth: 2, borderColor: 'transparent', ...SHADOWS.small },
  paymentBtnActive: { borderColor: COLORS.primary },
  paymentBtnGradient: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: 2 },
  paymentIcon: { fontSize: 20, marginRight: 12 },
  paymentName: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  paymentNameActive: { color: COLORS.text },
  paymentCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  paymentCheckText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  paymentInputContainer: { marginTop: 16, marginBottom: 16 },
  paymentInputLabel: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  paymentInput: { backgroundColor: COLORS.surface, padding: 16, borderRadius: SIZES.radius, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.surfaceLighter, ...SHADOWS.small },
  confirmBtn: { marginTop: 8, borderRadius: SIZES.radius, overflow: 'hidden', ...SHADOWS.glow },
  confirmBtnDisabled: { ...SHADOWS.small },
  confirmBtnGradient: { padding: 18, alignItems: 'center' },
  confirmText: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  successContainer: { alignItems: 'center', marginBottom: 24 },
  successIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, ...SHADOWS.glow },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  successSubtitle: { color: COLORS.success, fontSize: 15, fontWeight: '600' },
  ticketCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLarge, marginBottom: 20, overflow: 'hidden', ...SHADOWS.large },
  ticketHeader: { backgroundColor: COLORS.surfaceLighter, padding: 20 },
  ticketMovie: { fontSize: 20, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  ticketCinema: { color: COLORS.textSecondary, fontSize: 14 },
  ticketDetails: { padding: 20 },
  ticketDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ticketDetailIcon: { fontSize: 16, marginRight: 10 },
  ticketDetailLabel: { color: COLORS.textMuted, fontSize: 14, width: 60 },
  ticketDetailValue: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1 },
  ticketTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopWidth: 1, borderTopColor: COLORS.surfaceLighter },
  ticketTotalLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  ticketTotalValue: { color: COLORS.primary, fontSize: 22, fontWeight: '800' },
  doneBtn: { borderRadius: SIZES.radius, overflow: 'hidden', ...SHADOWS.glow },
  doneBtnGradient: { padding: 16, alignItems: 'center' },
  doneBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
});

