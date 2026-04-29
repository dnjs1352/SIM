import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('TkAgg')
import numpy as np
from typing import Dict, List
import json
from datetime import datetime


class SimulationVisualizer:
    """시뮬레이션 결과 시각화 클래스"""
    
    def __init__(self, results: Dict):
        self.results = results
        self.fig = None
        self.axes = None
        
    def create_dashboard(self):
        """대시보드 생성 및 표시"""
        plt.style.use('seaborn-v0_8-darkgrid')
        self.fig, self.axes = plt.subplots(2, 3, figsize=(18, 10))
        self.fig.suptitle('🏭 공장 생산라인 시뮬레이션 대시보드', fontsize=16, fontweight='bold')
        
        # 1. 완료율 게이지
        self._plot_completion_gauge(self.axes[0, 0])
        
        # 2. 시간별 생��량
        self._plot_hourly_production(self.axes[0, 1])
        
        # 3. 생산 상태 파이 차트
        self._plot_production_status(self.axes[0, 2])
        
        # 4. 누적 생산량
        self._plot_cumulative_production(self.axes[1, 0])
        
        # 5. 평균 처리 시간
        self._plot_average_time(self.axes[1, 1])
        
        # 6. 통계 정보
        self._plot_statistics(self.axes[1, 2])
        
        plt.tight_layout()
        plt.show()
        
    def _plot_completion_gauge(self, ax):
        """완료율 게이지 차트"""
        completion_rate = self.results['completion_rate']
        
        # 게이지 차트
        theta = np.linspace(0, np.pi, 100)
        r = 1
        ax.plot(r * np.cos(theta), r * np.sin(theta), 'k-', linewidth=2)
        
        # 바늘
        needle_angle = np.pi * (completion_rate / 100)
        ax.arrow(0, 0, np.cos(needle_angle), np.sin(needle_angle), 
                head_width=0.1, head_length=0.1, fc='red', ec='red', linewidth=2)
        
        ax.set_xlim(-1.3, 1.3)
        ax.set_ylim(-0.3, 1.3)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.set_title(f'완료율: {completion_rate:.1f}%', fontweight='bold')
        
        # 범위 표시
        ax.text(-1.2, -0.15, '0%', ha='center')
        ax.text(0, 1.15, '50%', ha='center')
        ax.text(1.2, -0.15, '100%', ha='center')
        
    def _plot_hourly_production(self, ax):
        """시간별 생산량 라인 차트"""
        hourly_prod = self.results['hourly_production']
        
        if hourly_prod:
            hours = sorted(hourly_prod.keys())
            quantities = [hourly_prod[h] for h in hours]
            
            ax.plot(hours, quantities, marker='o', linestyle='-', linewidth=2, markersize=8, color='#2E86AB')
            ax.fill_between(hours, quantities, alpha=0.3, color='#2E86AB')
            ax.set_xlabel('시간 (시)', fontweight='bold')
            ax.set_ylabel('생산량 (개)', fontweight='bold')
            ax.set_title('시간별 생산량', fontweight='bold')
            ax.grid(True, alpha=0.3)
        else:
            ax.text(0.5, 0.5, '데이터 없음', ha='center', va='center')
            ax.set_title('시간별 생산량', fontweight='bold')
        
    def _plot_production_status(self, ax):
        """생산 상태 파이 차트"""
        completed = self.results['completed_products']
        total = self.results['total_products']
        remaining = total - completed
        
        sizes = [completed, remaining]
        labels = [f'완료\n({completed}개)', f'미완료\n({remaining}개)']
        colors = ['#06D6A0', '#EF476F']
        explode = (0.05, 0)
        
        ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', 
               startangle=90, explode=explode, textprops={'fontsize': 10, 'weight': 'bold'})
        ax.set_title('생산 상태', fontweight='bold')
        
    def _plot_cumulative_production(self, ax):
        """누적 생산량 차트"""
        hourly_prod = self.results['hourly_production']
        
        if hourly_prod:
            hours = sorted(hourly_prod.keys())
            quantities = [hourly_prod[h] for h in hours]
            cumulative = np.cumsum(quantities)
            
            ax.bar(hours, quantities, alpha=0.5, label='시간별 생산량', color='#A23B72')
            ax.plot(hours, cumulative, marker='s', linestyle='-', linewidth=2, 
                   markersize=6, label='누적 생산량', color='#F18F01')
            
            ax.set_xlabel('시간 (시)', fontweight='bold')
            ax.set_ylabel('생산량 (개)', fontweight='bold')
            ax.set_title('누적 생산량 추이', fontweight='bold')
            ax.legend(loc='upper left')
            ax.grid(True, alpha=0.3, axis='y')
        else:
            ax.text(0.5, 0.5, '데이터 없음', ha='center', va='center')
            ax.set_title('누적 생산량 추이', fontweight='bold')
        
    def _plot_average_time(self, ax):
        """평균 처리 시간 표시"""
        avg_time = self.results['average_processing_time']
        
        ax.barh(['평균 처리\n시간'], [avg_time], color='#06A77D', height=0.5)
        ax.set_xlabel('시간 (분)', fontweight='bold')
        ax.set_title('평균 처리 시간', fontweight='bold')
        ax.set_xlim(0, max(10, avg_time * 1.2))
        
        # 값 표시
        ax.text(avg_time + 0.2, 0, f'{avg_time:.2f}분', va='center', fontweight='bold')
        
    def _plot_statistics(self, ax):
        """통계 정보 표시"""
        ax.axis('off')
        
        stats_text = f"""
        📊 주요 통계 정보
        
        ✅ 완료된 제품: {self.results['completed_products']}/{self.results['total_products']}개
        📈 완료율: {self.results['completion_rate']:.1f}%
        ⏱️  평균 처리 시간: {self.results['average_processing_time']:.2f}분
        ⏳ 총 시뮬레이션 시간: {self.results['current_time']:.1f}분
        
        🤖 기계 정보
        """
        
        # 기계별 정보 추가
        if 'machines' in self.results:
            for machine in self.results['machines']:
                stats_text += f"\n{machine.name}: {machine.total_processed}개 처리"
        
        ax.text(0.1, 0.9, stats_text, transform=ax.transAxes, fontsize=11,
               verticalalignment='top', fontfamily='monospace',
               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
        
    def export_results(self, filename: str = 'production_results.txt'):
        """결과를 파일로 저장"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("🏭 공장 생산라인 시뮬레이션 결과\n")
            f.write("=" * 60 + "\n\n")
            
            # 기본 통계
            f.write("📊 기본 통계\n")
            f.write("-" * 60 + "\n")
            f.write(f"완료된 제품: {self.results['completed_products']}/{self.results['total_products']}개\n")
            f.write(f"완료율: {self.results['completion_rate']:.1f}%\n")
            f.write(f"평균 처리 시간: {self.results['average_processing_time']:.2f}분\n")
            f.write(f"총 시뮬레이션 시간: {self.results['current_time']:.1f}분\n\n")
            
            # 시간별 생산량
            f.write("⏰ 시간별 생산량\n")
            f.write("-" * 60 + "\n")
            hourly_prod = self.results['hourly_production']
            if hourly_prod:
                for hour in sorted(hourly_prod.keys()):
                    f.write(f"{hour}시간: {hourly_prod[hour]}개\n")
            else:
                f.write("데이터 없음\n")
            f.write("\n")
            
            # 기계별 정보
            f.write("🤖 기계별 처리 정보\n")
            f.write("-" * 60 + "\n")
            if 'machines' in self.results:
                for machine in self.results['machines']:
                    f.write(f"{machine.name}:\n")
                    f.write(f"  - 처리한 제품: {machine.total_processed}개\n")
                    f.write(f"  - 평균 처리 시간: {machine.process_time:.2f}분\n")
            f.write("\n")
            
            f.write("=" * 60 + "\n")
            f.write(f"생성 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 60 + "\n")
        
        print(f"✅ 결과가 {filename}에 저장되었습니다.")
